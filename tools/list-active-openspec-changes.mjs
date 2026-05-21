import fs from "node:fs"
import path from "node:path"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const KIND_ORDER = ["focus", "release", "idea", "producer", "dispatcher", "implement", "fix"]
const KIND_ICONS = new Map([
  ["focus", "🩸"],
  ["dispatcher", "🔸"],
  ["idea", "🦋"],
  ["producer", "🍀"],
  ["fix", "🔥"],
  ["release", "🌟"],
])
const RED = "\u001B[31m"
const BRIGHT_WHITE = "\u001B[97m"
const RESET = "\u001B[0m"

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os")
  console.error("  npm run os:short")
  console.error("  npm run os -- <слово>")
  console.error("  node tools/list-active-openspec-changes.mjs [--short] [слово]")
}

function parseArgs(argv) {
  let shortMode = false
  let highlightNeedle = ""

  for (const arg of argv) {
    if (arg === "--short") {
      shortMode = true
      continue
    }

    if (arg.startsWith("-")) {
      throw new Error(`Неизвестный флаг: ${arg}`)
    }

    if (highlightNeedle) {
      throw new Error(`Слишком много аргументов: ${argv.join(", ")}`)
    }

    highlightNeedle = arg
  }

  return { shortMode, highlightNeedle }
}

function listChangeDirs(changesDir) {
  return fs
    .readdirSync(changesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => path.join(changesDir, entry.name))
    .sort((left, right) => path.basename(left).localeCompare(path.basename(right)))
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) {
    return null
  }

  return fs.readFileSync(filePath, "utf8")
}

function isSuspended(proposalText) {
  return /## Status\s+Suspended\./m.test(proposalText)
}

function readMetaValue(metadataText, key) {
  if (!metadataText) {
    return null
  }

  const match = metadataText.match(new RegExp(`^${key}:\\s*(.+)\\s*$`, "m"))
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null
}

function extractWhySummary(proposalText) {
  const match = proposalText.match(/## Why\s+([\s\S]*?)(?:\n## |\n# |$)/)

  if (!match) {
    return null
  }

  const normalizedBody = match[1].trim()
  const paragraphs = normalizedBody
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) {
    return null
  }

  const firstParagraph = paragraphs[0]

  if (firstParagraph.startsWith("- ")) {
    return null
  }

  const normalizedParagraph = firstParagraph.replace(/\s+/g, " ").trim()
  const firstSentenceMatch = normalizedParagraph.match(/^(.+?[.!?])(?:\s|$)/)
  return (firstSentenceMatch?.[1] || normalizedParagraph).trim()
}

function readChange(changeDir) {
  const name = path.basename(changeDir)
  const proposalText = readText(path.join(changeDir, "proposal.md"))

  if (proposalText && isSuspended(proposalText)) {
    return null
  }

  const metadataText = readText(path.join(changeDir, ".openspec.yaml"))
  const short = readMetaValue(metadataText, "short")
  const kind = readMetaValue(metadataText, "change_kind") || "idea"
  const parent = readMetaValue(metadataText, "parent_change") || ""

  return {
    name,
    kind,
    parent,
    summary: short || extractWhySummary(proposalText || "") || "Нет краткого пояснения.",
  }
}

function filterChanges(changes, shortMode) {
  if (!shortMode) {
    return changes
  }

  return changes.filter((change) => !["implement", "fix"].includes(change.kind))
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function highlightText(text, needle) {
  if (!needle) {
    return text
  }

  const pattern = new RegExp(escapeRegExp(needle), "gi")
  return text.replace(pattern, (match) => `${RED}${match}${RESET}`)
}

function styleRootName(text, depth, shortMode) {
  if (depth !== 0 || shortMode) {
    return text
  }

  return `${BRIGHT_WHITE}${text}${RESET}`
}

function iconForKind(kind) {
  return KIND_ICONS.get(kind) || "  "
}

function kindRank(kind) {
  const index = KIND_ORDER.indexOf(kind)
  return index === -1 ? KIND_ORDER.length : index
}

function sortChanges(list) {
  return list.sort(
    (left, right) => kindRank(left.kind) - kindRank(right.kind) || left.name.localeCompare(right.name),
  )
}

function buildTreeLines(changes, highlightNeedle, shortMode) {
  const byName = new Map(changes.map((change) => [change.name, change]))
  const children = new Map(changes.map((change) => [change.name, []]))

  for (const change of changes) {
    if (!change.parent || !byName.has(change.parent)) {
      continue
    }
    children.get(change.parent).push(change)
  }

  for (const entry of children.values()) {
    sortChanges(entry)
  }

  const roots = sortChanges(
    changes.filter((change) => !change.parent || !byName.has(change.parent) || kindRank(change.kind) === 0),
  )

  const visited = new Set()
  const lines = []

  function collectNode(node, depth) {
    if (visited.has(node.name)) {
      return
    }

    visited.add(node.name)

    const indent = "  ".repeat(depth)
    const icon = iconForKind(node.kind)
    const name = styleRootName(highlightText(node.name, highlightNeedle), depth, shortMode)
    const summary = highlightText(node.summary, highlightNeedle)

    lines.push({ depth, text: `${indent}${icon} ${name}\t${summary}` })

    for (const child of children.get(node.name) || []) {
      collectNode(child, depth + 1)
    }
  }

  for (const root of roots) {
    collectNode(root, 0)
  }

  const orphaned = sortChanges(changes.filter((change) => !visited.has(change.name)))

  for (const orphan of orphaned) {
    collectNode(orphan, 0)
  }

  return lines
}

function main() {
  const args = process.argv.slice(2)

  if (args.includes("--help") || args.includes("-h")) {
    printUsage()
    return
  }

  let parsedArgs

  try {
    parsedArgs = parseArgs(args)
  } catch (error) {
    console.error(error.message)
    console.error("")
    printUsage()
    process.exit(1)
  }

  if (!fs.existsSync(CHANGES_DIR)) {
    console.error(`Каталог changes не найден: ${CHANGES_DIR}`)
    process.exit(1)
  }

  const changes = filterChanges(listChangeDirs(CHANGES_DIR).map(readChange).filter(Boolean), parsedArgs.shortMode)

  if (changes.length === 0) {
    console.log("Нет актуальных changes.")
    return
  }

  const lines = buildTreeLines(changes, parsedArgs.highlightNeedle, parsedArgs.shortMode)

  for (let index = 0; index < lines.length; index += 1) {
    const current = lines[index]
    const next = lines[index + 1]
    console.log(current.text)

    if (next && next.depth < current.depth) {
      console.log("")
    }
  }
}

main()
