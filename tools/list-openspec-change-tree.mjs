import fs from "node:fs"
import path from "node:path"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const KIND_ORDER = ["focus", "idea", "research", "dispatcher", "implement"]

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:tree")
  console.error("  node tools/list-openspec-change-tree.mjs")
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

  if (!proposalText || isSuspended(proposalText)) {
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
    summary: short || extractWhySummary(proposalText) || "Нет краткого пояснения в секции Why.",
  }
}

function main() {
  const args = process.argv.slice(2)

  if (args.includes("--help") || args.includes("-h")) {
    printUsage()
    return
  }

  if (args.length > 0) {
    console.error(`Неизвестные аргументы: ${args.join(", ")}`)
    console.error("")
    printUsage()
    process.exit(1)
  }

  if (!fs.existsSync(CHANGES_DIR)) {
    console.error(`Каталог changes не найден: ${CHANGES_DIR}`)
    process.exit(1)
  }

  const changes = listChangeDirs(CHANGES_DIR).map(readChange).filter(Boolean)

  if (changes.length === 0) {
    console.log("Нет актуальных changes.")
    return
  }

  const byName = new Map(changes.map((change) => [change.name, change]))
  const children = new Map(changes.map((change) => [change.name, []]))

  for (const change of changes) {
    if (!change.parent || !byName.has(change.parent)) {
      continue
    }
    children.get(change.parent).push(change)
  }

  const kindRank = (kind) => {
    const index = KIND_ORDER.indexOf(kind)
    return index === -1 ? KIND_ORDER.length : index
  }

  const sortChanges = (list) =>
    list.sort(
      (left, right) => kindRank(left.kind) - kindRank(right.kind) || left.name.localeCompare(right.name),
    )

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
    lines.push({ depth, text: `${indent}${node.name}\t${node.summary}` })

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
