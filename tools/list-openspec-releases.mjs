import fs from "node:fs"
import path from "node:path"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const BRIGHT_WHITE = "\u001B[97m"
const RESET = "\u001B[0m"

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

  const changes = listActiveChangeDirs(CHANGES_DIR)
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
    const release = releases[index]
    console.log(`${BRIGHT_WHITE}${release.name}${RESET}\t${release.short}`)

    const members = [...byName.values()]
      .filter((change) => change.releaseRef === release.name)
      .sort((a, b) => a.name.localeCompare(b.name))

    if (members.length === 0) {
      console.log(`  (пусто)\tнет привязанных changes`)
    } else {
      const membersByName = new Map(members.map((member) => [member.name, member]))
      const children = new Map(members.map((member) => [member.name, []]))

      for (const member of members) {
        if (!member.parent || !membersByName.has(member.parent)) {
          continue
        }
        children.get(member.parent).push(member)
      }

      for (const nodeChildren of children.values()) {
        nodeChildren.sort((left, right) => left.name.localeCompare(right.name))
      }

      const roots = members
        .filter((member) => !member.parent || !membersByName.has(member.parent))
        .sort((left, right) => left.name.localeCompare(right.name))
      const visited = new Set()

      function printNode(node, depth) {
        if (visited.has(node.name)) {
          return
        }
        visited.add(node.name)
        const indent = "  ".repeat(depth + 1)
        console.log(`${indent}${node.name}\t${node.short}`)
        for (const child of children.get(node.name) || []) {
          printNode(child, depth + 1)
        }
      }

      for (const root of roots) {
        printNode(root, 0)
      }

      const orphans = members.filter((member) => !visited.has(member.name)).sort((a, b) => a.name.localeCompare(b.name))
      for (const orphan of orphans) {
        printNode(orphan, 0)
      }
    }

    if (index < releases.length - 1) {
      console.log("")
    }
  }
}

main()
