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

function inheritedRoadmapsForParent(meta, readParent) {
  if (meta.roadmapRefs.length > 0) {
    return meta.roadmapRefs
  }

  let current = meta.parentChange

  while (current) {
    const parentMeta = readParent(current)
    if (parentMeta.roadmapRefs.length > 0) {
      return parentMeta.roadmapRefs
    }
    current = parentMeta.parentChange
  }

  return []
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
  console.log(`- parent change: ${meta.parentChange || "(не задан)"}`)
  console.log(`- strategy_root: ${meta.strategyRoot || "(не задан)"}`)
  console.log(`- release_ref: ${meta.releaseRef || "(не задан)"}`)
  console.log(`- producer_ref: ${meta.producerRef || "(не задан)"}`)

  if (meta.parentChange) {
    const parentMeta = readMetadata(meta.parentChange)
    const parentLabel = parentMeta.kind === "dispatcher" ? "dispatcher" : "parent"

    console.log(`- ${parentLabel} metadata: openspec/changes/${meta.parentChange}/.openspec.yaml`)
    console.log(`- ${parentLabel} proposal: openspec/changes/${meta.parentChange}/proposal.md`)
    console.log(`- ${parentLabel} design: openspec/changes/${meta.parentChange}/design.md`)
    console.log(`- ${parentLabel} tasks: openspec/changes/${meta.parentChange}/tasks.md`)
    console.log("- parent change отвечает за постановку implement/fix и приёмку результата")

    for (const ref of inheritedRoadmapsForParent(parentMeta, readMetadata)) {
      console.log(`- inherited roadmap: openspec/changes/${ref}`)
    }
  }
  const effectiveProducer = meta.producerRef || (meta.parentChange && readMetadata(meta.parentChange).kind === "producer" ? meta.parentChange : "")
  if (effectiveProducer) {
    console.log(`- producer metadata: openspec/changes/${effectiveProducer}/.openspec.yaml`)
    console.log(`- producer proposal: openspec/changes/${effectiveProducer}/proposal.md`)
    console.log(`- producer design: openspec/changes/${effectiveProducer}/design.md`)
    console.log(`- producer tasks: openspec/changes/${effectiveProducer}/tasks.md`)
    console.log(`- producer roadmaps: openspec/changes/${effectiveProducer}/roadmaps`)
    console.log("- producer остаётся owner смысла и процесса линии")
  }
  console.log(`- local handoff: openspec/changes/${parsed.changeName}/${HANDOFF_FILE}`)
}

const entrypointArg = process.argv[1]
const isCliEntrypoint = entrypointArg ? import.meta.url === pathToFileURL(entrypointArg).href : false

if (isCliEntrypoint) {
  runOpenSpecContext()
}
