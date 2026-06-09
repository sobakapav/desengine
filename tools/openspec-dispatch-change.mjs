import path from "node:path"
import { fileURLToPath } from "node:url"

import { normalizeDispatchedChangeName } from "./openspec-change-name.mjs"
import { readMetadata, updateMetadata } from "./openspec-change-state.mjs"
import { assertHandoffInheritedContext, syncHandoffInheritedContext } from "./openspec-handoff.mjs"
import { runOpenSpecBegin } from "./openspec-begin-change.mjs"

function getChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
}

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

function syncReleaseInclusion(changeName, releaseName) {
  updateMetadata(changeName, {
    release_ref: releaseName,
  })

  const finalMeta = readMetadata(changeName)
  const changeDir = path.join(getChangesDir(), changeName)

  syncHandoffInheritedContext(changeDir, {
    parentChange: finalMeta.parentChange,
    strategyRoot: finalMeta.strategyRoot,
    releaseRef: finalMeta.releaseRef,
    producerRef: finalMeta.producerRef,
    verificationLevel: finalMeta.verificationLevel,
    verificationCommand: finalMeta.verificationCommand,
  })

  const reloadedMeta = readMetadata(changeName)
  if (reloadedMeta.releaseRef !== releaseName) {
    throw new Error(`Release inclusion не завершён: .openspec.yaml для ${changeName} не содержит ожидаемый release_ref=${releaseName}`)
  }

  assertHandoffInheritedContext(changeDir, {
    parentChange: reloadedMeta.parentChange,
    strategyRoot: reloadedMeta.strategyRoot,
    releaseRef: reloadedMeta.releaseRef,
    producerRef: reloadedMeta.producerRef,
    verificationLevel: reloadedMeta.verificationLevel,
    verificationCommand: reloadedMeta.verificationCommand,
  })
}

function runOpenSpecDispatch(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv)

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
  const args = [dispatcherName, "--spawn-implement", changeName]

  if (parsed.description) {
    args.push("--description", parsed.description)
  }
  runOpenSpecBegin(args)

  if (releaseName) {
    syncReleaseInclusion(changeName, releaseName)
  }

  console.log("")
  if (releaseName) {
    console.log(`Релизная диспетчеризация завершена: ${releaseName} -> ${dispatcherName} -> ${changeName}`)
  } else {
    console.log(`Диспетчеризация завершена: ${dispatcherName} -> ${changeName}`)
  }
  console.log(`Исполнение вести только в ${changeName}`)
}

const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (executedDirectly) {
  runOpenSpecDispatch()
}

export {
  runOpenSpecDispatch,
}
