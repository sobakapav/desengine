import fs from "node:fs"
import path from "node:path"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:r")
  console.error("  node tools/list-openspec-releases.mjs")
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
    return ""
  }
  const match = metadataText.match(new RegExp(`^${key}:\\s*(.+)\\s*$`, "m"))
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : ""
}

function readChange(changeDir) {
  const name = path.basename(changeDir)
  const metadata = readText(path.join(changeDir, ".openspec.yaml"))
  const proposal = readText(path.join(changeDir, "proposal.md"))

  if (!proposal || isSuspended(proposal)) {
    return null
  }

  return {
    name,
    kind: readMetaValue(metadata, "change_kind") || "idea",
    short: readMetaValue(metadata, "short") || "нет краткого описания",
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

  const changes = listChangeDirs(CHANGES_DIR).map(readChange).filter(Boolean)
  const releases = changes.filter((change) => change.kind === "release").sort((a, b) => a.name.localeCompare(b.name))

  if (releases.length === 0) {
    console.log("Нет активных release changes.")
    return
  }

  for (let index = 0; index < releases.length; index += 1) {
    const release = releases[index]
    console.log(`${release.name}\t${release.short}`)

    const members = changes
      .filter((change) => change.releaseRef === release.name)
      .sort((a, b) => a.name.localeCompare(b.name))

    if (members.length === 0) {
      console.log(`  (пусто)\tнет привязанных changes`)
    } else {
      for (const member of members) {
        console.log(`  ${member.name}\t${member.short}`)
      }
    }

    if (index < releases.length - 1) {
      console.log("")
    }
  }
}

main()
