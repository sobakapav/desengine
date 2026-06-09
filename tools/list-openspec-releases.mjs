import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const BRIGHT_WHITE = "\u001B[97m"
const RESET = "\u001B[0m"
const KIND_ICONS = new Map([
  ["focus", "🩸"],
  ["dispatcher", "🔸"],
  ["idea", "🦋"],
  ["producer", "🍀"],
  ["fix", "🔥"],
  ["release", "🌟"],
])

function resolveChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
}

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:r")
  console.error("  node tools/list-openspec-releases.mjs")
}

function listActiveChangeDirs(changesDir) {
  return fs
    .readdirSync(changesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => path.join(changesDir, entry.name))
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
    return ""
  }
  const match = metadataText.match(new RegExp(`^${key}:\\s*(.+)\\s*$`, "m"))
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : ""
}

function canonicalNameFromPath(changeDir) {
  const name = path.basename(changeDir)
  return name.replace(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-/, "")
}

function iconForKind(kind) {
  return KIND_ICONS.get(kind) || "  "
}

function visibleLength(text) {
  return text.replace(/\u001B\[[0-9;]*m/g, "").length
}

function alignEntries(entries) {
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

function readChange(changeDir) {
  const name = canonicalNameFromPath(changeDir)
  const metadata = readText(path.join(changeDir, ".openspec.yaml"))
  const proposal = readText(path.join(changeDir, "proposal.md"))

  if (!proposal || isSuspended(proposal)) {
    return null
  }

  return {
    name,
    kind: readMetaValue(metadata, "change_kind") || "idea",
    short: readMetaValue(metadata, "short") || "нет краткого описания",
    parent: readMetaValue(metadata, "parent_change") || "",
    releaseRef: readMetaValue(metadata, "release_ref"),
  }
}

/**
 * @example
 * runListOpenSpecReleases([])
 */
export function runListOpenSpecReleases(args = process.argv.slice(2)) {

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

  const changesDir = resolveChangesDir()

  if (!fs.existsSync(changesDir)) {
    console.error(`Каталог changes не найден: ${changesDir}`)
    process.exit(1)
  }

  const changes = listActiveChangeDirs(changesDir)
    .map((dirPath) => readChange(dirPath))
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))

  const byName = new Map()
  for (const change of changes) {
    if (!byName.has(change.name)) {
      byName.set(change.name, change)
    }
  }

  const releases = [...byName.values()].filter((change) => change.kind === "release").sort((a, b) => a.name.localeCompare(b.name))

  if (releases.length === 0) {
    console.log("Нет активных release changes.")
    return
  }

  for (let index = 0; index < releases.length; index += 1) {
    if (index > 0) {
      console.log("")
    }

    const release = releases[index]
    const entries = [
      {
        depth: 0,
        prefixWidth: visibleLength(`${iconForKind("release")} ${release.name}`),
        prefixText: `${iconForKind("release")} ${BRIGHT_WHITE}${release.name}${RESET}`,
        summary: release.short,
      },
    ]

    const members = [...byName.values()]
      .filter((change) => change.releaseRef === release.name)
      .filter((change) => change.kind === "implement" || change.kind === "fix")
      .sort((a, b) => a.name.localeCompare(b.name))

    if (members.length === 0) {
      entries.push({
        depth: 1,
        prefixWidth: visibleLength("  (пусто)"),
        prefixText: "  (пусто)",
        summary: "нет привязанных changes",
      })
    } else {
      const matrixNodes = new Map(members.map((member) => [member.name, member]))

      for (const member of members) {
        if (!member.parent) {
          continue
        }

        const parent = byName.get(member.parent)
        if (!parent || parent.kind !== "dispatcher" || matrixNodes.has(parent.name)) {
          continue
        }

        matrixNodes.set(parent.name, parent)
      }

      const matrix = [...matrixNodes.values()].sort((a, b) => a.name.localeCompare(b.name))
      const membersByName = new Map(matrix.map((member) => [member.name, member]))
      const children = new Map(matrix.map((member) => [member.name, []]))

      for (const member of matrix) {
        if (!member.parent || !membersByName.has(member.parent)) {
          continue
        }
        children.get(member.parent).push(member)
      }

      for (const nodeChildren of children.values()) {
        nodeChildren.sort((left, right) => left.name.localeCompare(right.name))
      }

      const roots = matrix
        .filter((member) => !member.parent || !membersByName.has(member.parent))
        .sort((left, right) => left.name.localeCompare(right.name))
      const visited = new Set()

      function collectNode(node, depth) {
        if (visited.has(node.name)) {
          return
        }
        visited.add(node.name)
        const indent = "  ".repeat(depth + 1)
        const prefix = `${indent}${iconForKind(node.kind)} ${node.name}`
        entries.push({
          depth: depth + 1,
          prefixWidth: visibleLength(prefix),
          prefixText: prefix,
          summary: node.short,
        })
        for (const child of children.get(node.name) || []) {
          collectNode(child, depth + 1)
        }
      }

      for (const root of roots) {
        collectNode(root, 0)
      }

      const orphans = matrix.filter((member) => !visited.has(member.name)).sort((a, b) => a.name.localeCompare(b.name))
      for (const orphan of orphans) {
        collectNode(orphan, 0)
      }
    }

    const lines = alignEntries(entries)

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const current = lines[lineIndex]
      const next = lines[lineIndex + 1]
      console.log(current.text)

      if (next && next.depth < current.depth) {
        console.log("")
      }
    }
  }
}

const entrypointArg = process.argv[1]
const isCliEntrypoint = entrypointArg ? import.meta.url === pathToFileURL(entrypointArg).href : false

if (isCliEntrypoint) {
  runListOpenSpecReleases()
}
