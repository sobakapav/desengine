import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { HANDOFF_FILE } from "./openspec-handoff.mjs"

function resolveChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
}

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

function parseRoadmapRefs(text) {
  const refs = []
  const singleMatch = text.match(/^roadmap_ref:\s*(.+)\s*$/m)

  if (singleMatch) {
    const ref = singleMatch[1].trim().replace(/^["']|["']$/g, "")

    if (ref) {
      refs.push(ref)
    }
  }

  const listMatch = text.match(/^roadmap_refs:\s*\n((?:\s*-\s*.+\n?)*)/m)

  if (listMatch) {
    const listRefs = listMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean)

    for (const ref of listRefs) {
      if (!refs.includes(ref)) {
        refs.push(ref)
      }
    }
  }

  return refs
}

function readMetadata(changeName) {
  const metadataPath = path.join(resolveChangesDir(), changeName, ".openspec.yaml")
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
    producerRef: readValue("producer_ref"),
    roadmapRefs: parseRoadmapRefs(text),
  }
}

/**
 * @example
 * runOpenSpecContext(["implement-demo"])
 */
export function runOpenSpecContext(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv)
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
  console.log("- код меняется только в implement/fix; этот change не пересматривает стратегию и тактику")
  console.log(`- parent dispatcher: ${meta.parentChange || "(не задан)"}`)
  console.log(`- strategy_root: ${meta.strategyRoot || "(не задан)"}`)
  console.log(`- release_ref: ${meta.releaseRef || "(не задан)"}`)
  console.log(`- producer_ref: ${meta.producerRef || "(не задан)"}`)

  if (meta.parentChange) {
    const dispatcherMeta = readMetadata(meta.parentChange)

    console.log(`- dispatcher metadata: openspec/changes/${meta.parentChange}/.openspec.yaml`)
    console.log(`- dispatcher proposal: openspec/changes/${meta.parentChange}/proposal.md`)
    console.log(`- dispatcher design: openspec/changes/${meta.parentChange}/design.md`)
    console.log(`- dispatcher tasks: openspec/changes/${meta.parentChange}/tasks.md`)
    console.log("- parent dispatcher отвечает за тактику, постановку implement/fix и приёмку результата")

    if (dispatcherMeta.roadmapRefs.length > 0) {
      for (const ref of dispatcherMeta.roadmapRefs) {
        console.log(`- inherited roadmap: openspec/changes/${ref}`)
      }
    }
  }
  if (meta.producerRef) {
    console.log(`- producer metadata: openspec/changes/${meta.producerRef}/.openspec.yaml`)
    console.log(`- producer proposal: openspec/changes/${meta.producerRef}/proposal.md`)
    console.log(`- producer design: openspec/changes/${meta.producerRef}/design.md`)
    console.log(`- producer tasks: openspec/changes/${meta.producerRef}/tasks.md`)
    console.log(`- producer roadmaps: openspec/changes/${meta.producerRef}/roadmaps`)
    console.log("- producer задаёт ожидания и рамки, но не подменяет parent dispatcher")
  }
  console.log(`- local handoff: openspec/changes/${parsed.changeName}/${HANDOFF_FILE}`)
}

const entrypointArg = process.argv[1]
const isCliEntrypoint = entrypointArg ? import.meta.url === pathToFileURL(entrypointArg).href : false

if (isCliEntrypoint) {
  runOpenSpecContext()
}
