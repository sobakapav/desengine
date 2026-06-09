import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

const BRIGHT_WHITE = "\u001B[97m"
const RESET = "\u001B[0m"

function resolveChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
}

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:p")
  console.error("  node tools/list-openspec-producers.mjs")
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
    parent: readMetaValue(metadata, "parent_change") || "",
    producerRef: readMetaValue(metadata, "producer_ref") || "",
  }
}

function printTasks(tasks) {
  for (const task of tasks.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${task.name}\t${task.short}`)
  }
}

/**
 * @example
 * runListOpenSpecProducers([])
 */
export function runListOpenSpecProducers(args = process.argv.slice(2)) {

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

  const executableTasks = changes.filter((change) => ["implement", "fix"].includes(change.kind) && change.producerRef)
  const producers = changes
    .filter((change) => change.kind === "producer")
    .filter((producer) => executableTasks.some((task) => task.producerRef === producer.name))

  if (producers.length === 0) {
    console.log("Нет active producer changes с привязанными implement/fix.")
    return
  }

  for (let index = 0; index < producers.length; index += 1) {
    const producer = producers[index]
    console.log(`${BRIGHT_WHITE}${producer.name}${RESET}\t${producer.short}`)

    const tasks = executableTasks
      .filter((change) => change.producerRef === producer.name)
      .sort((a, b) => a.name.localeCompare(b.name))

    printTasks(tasks)

    if (index < producers.length - 1) {
      console.log("")
    }
  }
}

const entrypointArg = process.argv[1]
const isCliEntrypoint = entrypointArg ? import.meta.url === pathToFileURL(entrypointArg).href : false

if (isCliEntrypoint) {
  runListOpenSpecProducers()
}
