import fs from "node:fs"
import path from "node:path"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:ctx -- <implement-or-fix-change>")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true, changeName: "" }
  }
  const changeName = argv.find((arg) => !arg.startsWith("-")) || ""
  if (!changeName) {
    throw new Error("Не указано имя change.")
  }
  return { help: false, changeName }
}

function readMetadata(changeName) {
  const metadataPath = path.join(CHANGES_DIR, changeName, ".openspec.yaml")
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Change не найден: ${changeName}`)
  }
  const text = fs.readFileSync(metadataPath, "utf8")
  const readValue = (key) => {
    const match = text.match(new RegExp(`^${key}:\\s*(.+)\\s*$`, "m"))
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : ""
  }
  return {
    kind: readValue("change_kind"),
    parentChange: readValue("parent_change"),
    strategyRoot: readValue("strategy_root"),
    releaseRef: readValue("release_ref"),
    roadmapRef: readValue("roadmap_ref"),
  }
}

function run() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    printUsage()
    return
  }

  const meta = readMetadata(parsed.changeName)
  if (!["implement", "fix"].includes(meta.kind)) {
    console.log(`${parsed.changeName}: kind=${meta.kind}`)
    console.log("Контекстный переход нужен прежде всего для implement/fix.")
    return
  }

  console.log(`Контекст исполнения: ${parsed.changeName}`)
  console.log(`- parent dispatcher: ${meta.parentChange || "(не задан)"}`)
  console.log(`- strategy_root: ${meta.strategyRoot || "(не задан)"}`)
  console.log(`- release_ref: ${meta.releaseRef || "(не задан)"}`)

  if (meta.parentChange) {
    console.log(`- dispatcher metadata: openspec/changes/${meta.parentChange}/.openspec.yaml`)
    console.log(`- dispatcher proposal: openspec/changes/${meta.parentChange}/proposal.md`)
    console.log(`- dispatcher design: openspec/changes/${meta.parentChange}/design.md`)
    console.log(`- dispatcher tasks: openspec/changes/${meta.parentChange}/tasks.md`)
  }
}

run()
