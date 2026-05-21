import { spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { normalizeDispatchedChangeName } from "./openspec-change-name.mjs"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:dispatch -- <dispatcher-change> --kind <implement|fix> --name <short-name> --description \"...\"")
  console.error("  npm run os:dispatch -- <release-change> --dispatcher <dispatcher-change> --kind <implement|fix> --name <short-name> --description \"...\"")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true }
  }

  const parsed = {
    dispatcher: "",
    kind: "",
    name: "",
    description: "",
    release: "",
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (!parsed.dispatcher && !arg.startsWith("-")) {
      parsed.dispatcher = arg
      continue
    }
    if (arg === "--kind") {
      parsed.kind = (argv[index + 1] || "").trim()
      index += 1
      continue
    }
    if (arg === "--name") {
      parsed.name = (argv[index + 1] || "").trim()
      index += 1
      continue
    }
    if (arg === "--description") {
      parsed.description = argv[index + 1] || ""
      index += 1
      continue
    }
    if (arg === "--dispatcher") {
      parsed.release = (argv[index + 1] || "").trim()
      index += 1
      continue
    }
    if (arg.startsWith("--kind=")) {
      parsed.kind = arg.slice("--kind=".length).trim()
      continue
    }
    if (arg.startsWith("--name=")) {
      parsed.name = arg.slice("--name=".length).trim()
      continue
    }
    if (arg.startsWith("--description=")) {
      parsed.description = arg.slice("--description=".length)
      continue
    }
    if (arg.startsWith("--dispatcher=")) {
      parsed.release = arg.slice("--dispatcher=".length).trim()
      continue
    }
  }

  if (!parsed.dispatcher || !parsed.kind || !parsed.name) {
    throw new Error("Нужны параметры: dispatcher, kind и name.")
  }
  if (!["implement", "fix"].includes(parsed.kind)) {
    throw new Error("--kind должен быть implement или fix.")
  }

  return { ...parsed, help: false }
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
  }
}

function setReleaseRef(changeName, releaseName) {
  const metadataPath = path.join(CHANGES_DIR, changeName, ".openspec.yaml")
  let text = fs.readFileSync(metadataPath, "utf8")
  const line = `release_ref: "${releaseName}"`
  const pattern = /^release_ref:\s*.*$/m

  if (pattern.test(text)) {
    text = text.replace(pattern, line)
  } else {
    text = `${text.endsWith("\n") ? text : `${text}\n`}${line}\n`
  }

  fs.writeFileSync(metadataPath, text, "utf8")
}

function run() {
  const parsed = parseArgs(process.argv.slice(2))

  if (parsed.help) {
    printUsage()
    return
  }

  const sourceMeta = readMetadata(parsed.dispatcher)
  let dispatcherName = parsed.dispatcher
  let releaseName = ""

  if (sourceMeta.kind === "release") {
    if (!parsed.release) {
      throw new Error("Для release-диспетчеризации нужен --dispatcher <dispatcher-change>.")
    }
    const dispatcherMeta = readMetadata(parsed.release)
    if (dispatcherMeta.kind !== "dispatcher") {
      throw new Error(`--dispatcher должен ссылаться на dispatcher-change. Получено: ${dispatcherMeta.kind}`)
    }
    releaseName = parsed.dispatcher
    dispatcherName = parsed.release
  } else if (sourceMeta.kind !== "dispatcher") {
    throw new Error(`Источник диспетчеризации должен быть release или dispatcher. Получено: ${sourceMeta.kind}`)
  }

  const changeName = normalizeDispatchedChangeName(parsed.kind, parsed.name)
  const args = ["run", "os:begin", "--", dispatcherName, "--spawn-implement", changeName]

  if (parsed.description) {
    args.push("--description", parsed.description)
  }

  const result = spawnSync("npm", args, { stdio: "inherit" })
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }

  if (releaseName) {
    setReleaseRef(changeName, releaseName)
  }

  console.log("")
  if (releaseName) {
    console.log(`Релизная диспетчеризация завершена: ${releaseName} -> ${dispatcherName} -> ${changeName}`)
  } else {
    console.log(`Диспетчеризация завершена: ${dispatcherName} -> ${changeName}`)
  }
  console.log(`Исполнение вести только в ${changeName}`)
}

run()
