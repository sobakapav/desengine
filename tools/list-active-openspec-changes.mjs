import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

function resolveChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
}
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

function visibleLength(text) {
  return text.replace(/\u001B\[[0-9;]*m/g, "").length
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
  const entries = []

  function collectNode(node, depth) {
    if (visited.has(node.name)) {
      return
    }

    visited.add(node.name)

    const indent = "  ".repeat(depth)
    const icon = iconForKind(node.kind)
    const plainName = `${indent}${icon} ${node.name}`
    const name = styleRootName(highlightText(node.name, highlightNeedle), depth, shortMode)
    const summary = highlightText(node.summary, highlightNeedle)

    entries.push({
      depth,
      prefixWidth: visibleLength(plainName),
      prefixText: `${indent}${icon} ${name}`,
      summary,
    })

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

  const maxPrefixWidthByDepth = new Map()

  for (const entry of entries) {
    const current = maxPrefixWidthByDepth.get(entry.depth) || 0
    if (entry.prefixWidth > current) {
      maxPrefixWidthByDepth.set(entry.depth, entry.prefixWidth)
    }
  }

  return entries.map((entry) => {
    const targetWidth = maxPrefixWidthByDepth.get(entry.depth) || entry.prefixWidth
    const padding = " ".repeat(targetWidth - entry.prefixWidth + 2)
    return {
      depth: entry.depth,
      text: `${entry.prefixText}${padding}${entry.summary}`,
    }
  })
}

/**
 * @example
 * runListActiveOpenSpecChanges(["--short"])
 */
export function runListActiveOpenSpecChanges(args = process.argv.slice(2)) {

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

  const changesDir = resolveChangesDir()

  if (!fs.existsSync(changesDir)) {
    console.error(`Каталог changes не найден: ${changesDir}`)
    process.exit(1)
  }

  const changes = filterChanges(listChangeDirs(changesDir).map(readChange).filter(Boolean), parsedArgs.shortMode)

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

const entrypointArg = process.argv[1]
const isCliEntrypoint = entrypointArg ? import.meta.url === pathToFileURL(entrypointArg).href : false

if (isCliEntrypoint) {
  runListActiveOpenSpecChanges()
}
