import path from "node:path"
import { fileURLToPath } from "node:url"
import { getHandoffReadiness, HANDOFF_FILE, writeHandoffFile } from "./openspec-handoff.mjs"
import {
  createImplementChange,
  ensureApplyArtifacts,
  readMetadata,
  releaseMembers,
  updateMetadata,
} from "./openspec-change-state.mjs"

const ALLOWED_IMPLEMENT_KINDS = new Set(["implement", "fix"])

function getChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
}

function printRoadmapRefs(roadmapRefs) {
  if (roadmapRefs.length === 0) {
    return
  }

  console.log("")
  console.log("Наследуемые roadmap:")
  for (const ref of roadmapRefs) {
    console.log(`- openspec/changes/${ref}`)
  }
}

function printNonExecutableGuidance(changeName, current) {
  console.log(`Change ${changeName}: kind=${current.kind}, execution_mode=${current.executionMode}`)
  console.log("Прямое изменение кода здесь запрещено. Код меняют только implement/fix.")

  if (current.kind === "focus") {
    console.log("Focus задаёт стратегию и управляет downstream idea/producer/dispatcher changes.")
    console.log("Если нужен код, сначала переведи решение в producer или dispatcher, а затем в implement/fix.")
    return
  }

  if (current.kind === "idea") {
    console.log("Idea уточняет гипотезу и передаёт delivery вниз, но не меняет код напрямую.")
    console.log("Если решение созрело, оформи следующий producer или dispatcher change.")
    return
  }

  if (current.kind === "producer") {
    console.log("Producer формирует roadmap и ожидания, но не создаёт код напрямую.")
    console.log("Producer обязан работать через downstream dispatcher changes и принимать их результат на своём уровне.")
    return
  }

  if (current.kind === "release") {
    console.log("Release не меняет код напрямую.")
    console.log("Release управляет delivery implement/fix через os:dispatch и проверяет состав поставки.")
    console.log(`Следующий шаг: npm run os:dispatch -- ${changeName} --dispatcher <dispatcher-change> --kind fix --name <name> --description "..."`)
    return
  }

  if (current.kind === "dispatcher") {
    console.log("Dispatcher не меняет код напрямую.")
    console.log("Dispatcher обязан создавать implement/fix changes, передавать им inherited roadmap и принимать результат их работы.")
    printRoadmapRefs(current.roadmapRefs)
    console.log("")
    console.log("Следующий шаг:")
    console.log(`- Создать implement/fix change и связать его с ${changeName}`)
    console.log(`- Пример: npm run os:begin -- ${changeName} --spawn-implement implement-<имя> --description "..."`)
    return
  }

  console.log("Это не исполнительский change.")
}

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:begin -- <change-name>")
  console.error("  npm run os:begin -- <dispatcher-change> --spawn-implement <implement-change>")
  console.error("  npm run os:begin -- <dispatcher-change> --spawn-implement <implement-change> --description \"...\"")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true }
  }

  let changeName = null
  let spawnImplement = ""
  let description = ""

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (!changeName && !arg.startsWith("-")) {
      changeName = arg
      continue
    }

    if (arg === "--spawn-implement") {
      spawnImplement = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg.startsWith("--spawn-implement=")) {
      spawnImplement = arg.slice("--spawn-implement=".length).trim()
      continue
    }

    if (arg === "--description") {
      description = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg.startsWith("--description=")) {
      description = arg.slice("--description=".length)
      continue
    }
  }

  if (!changeName) {
    throw new Error("Не указано имя change.")
  }

  return { help: false, changeName, spawnImplement, description }
}

function ensureHandoffArtifact(changeName, context) {
  writeHandoffFile(`openspec/changes/${changeName}`, context)
  return true
}

function createHandoffContext(changeName, parentChange, description, finalMeta) {
  return {
    changeName,
    summary: description?.trim() || "описание реализации будет уточнено",
    parentChange,
    strategyRoot: finalMeta.strategyRoot,
    releaseRef: finalMeta.releaseRef,
    producerRef: finalMeta.producerRef,
    verificationLevel: finalMeta.verificationLevel,
    verificationCommand: finalMeta.verificationCommand,
  }
}

function printCreatedImplementSummary(args) {
  console.log("")
  console.log(`Создан исполнительский change: ${args.spawnImplement}`)
  console.log(`- parent_change: ${args.parentChange}`)
  console.log(`- strategy_root: ${args.strategyRoot}`)
  if (args.releaseRef) {
    console.log(`- release_ref: ${args.releaseRef}`)
  }
  if (args.createdArtifacts.length > 0) {
    console.log(`- автосозданы артефакты: ${args.createdArtifacts.join(", ")}`)
  }
  if (args.createdHandoff) {
    console.log(`- создан handoff: openspec/changes/${args.spawnImplement}/${HANDOFF_FILE}`)
    console.log("- перед исполнением обязательно заполнить handoff по существу")
  }
  console.log("- код меняется только в этом implement/fix change; dispatcher остаётся управляющим контуром")
  console.log("- после реализации dispatcher обязан принять результат через verification и traceability-слой")
  console.log(`Запусти: npm run os:begin -- ${args.spawnImplement}`)
}

function handleDispatcherBegin(parsed, current) {
  if (!parsed.spawnImplement) {
    printNonExecutableGuidance(parsed.changeName, current)
    process.exit(2)
  }

  createImplementChange(parsed.spawnImplement, parsed.description)
  const created = readMetadata(parsed.spawnImplement)

  updateMetadata(parsed.spawnImplement, {
    parent_change: parsed.changeName,
    strategy_root: current.strategyRoot || parsed.changeName,
    release_ref: current.releaseRef || created.releaseRef,
  })

  const finalMeta = readMetadata(parsed.spawnImplement)
  const createdArtifacts = ensureApplyArtifacts(parsed.spawnImplement, parsed.description)
  const createdHandoff = ensureHandoffArtifact(
    parsed.spawnImplement,
    createHandoffContext(parsed.spawnImplement, parsed.changeName, parsed.description, finalMeta),
  )

  printCreatedImplementSummary({
    spawnImplement: parsed.spawnImplement,
    parentChange: parsed.changeName,
    strategyRoot: current.strategyRoot || parsed.changeName,
    releaseRef: current.releaseRef,
    createdArtifacts,
    createdHandoff,
  })
}

function groupReleaseMembers(members) {
  const grouped = new Map()

  for (const member of members) {
    if (!["implement", "fix"].includes(member.kind)) {
      continue
    }

    const parent = member.parentChange || "(без dispatcher)"
    const list = grouped.get(parent) || []
    list.push(member)
    grouped.set(parent, list)
  }

  return grouped
}

function printReleaseMatrix(grouped) {
  if (grouped.size === 0) {
    console.log("- В релизе пока нет implement/fix changes")
    return
  }

  console.log("- Матрица релиза (dispatcher -> implement/fix):")
  for (const [parent, list] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${parent}`)
    for (const item of list.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`    ${item.name}`)
    }
  }
}

function handleReleaseBegin(parsed) {
  const members = releaseMembers(parsed.changeName)
  console.log(`Release-контекст: ${parsed.changeName}`)
  console.log("Прямое изменение кода здесь запрещено. Код меняют только implement/fix.")
  console.log("Release управляет delivery implement/fix через os:dispatch и проверяет состав поставки.")
  console.log(`- Привязанных changes: ${members.length}`)
  printReleaseMatrix(groupReleaseMembers(members))
  console.log("")
  console.log("Следующий шаг для новой хотелки из release-контекста:")
  console.log(`npm run os:dispatch -- ${parsed.changeName} --dispatcher <dispatcher-change> --kind fix --name <name> --description "..."`)
}

function handleImplementBegin(parsed, current) {
  const changesDir = getChangesDir()
  const handoff = getHandoffReadiness(path.join(changesDir, parsed.changeName))
  if (!handoff.ready) {
    console.error(`Change ${parsed.changeName} ещё не готов к исполнению.`)
    console.error(`- Заполни: openspec/changes/${parsed.changeName}/${HANDOFF_FILE}`)
    for (const error of handoff.errors) {
      console.error(`- ${error}`)
    }
    process.exit(2)
  }

  console.log(`Готово к реализации: ${parsed.changeName}`)
  console.log("- код меняется только в implement/fix; стратегия и тактика уже заданы предками")
  console.log(`- kind: ${current.kind}`)
  console.log(`- parent_change: ${current.parentChange || "(не задан)"}`)
  console.log(`- strategy_root: ${current.strategyRoot || "(не задан)"}`)
  console.log(`- producer_ref: ${current.producerRef || "(не задан)"}`)
  console.log(`- verification_level: ${current.verificationLevel || "(не задан)"}`)
  console.log(`- verification_command: ${current.verificationCommand || "(не задан)"}`)
  console.log("- parent dispatcher отвечает за постановку и приёмку результата")
  console.log(`- handoff: openspec/changes/${parsed.changeName}/${HANDOFF_FILE}`)
}

function runOpenSpecBegin(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv)

  if (parsed.help) {
    printUsage()
    return
  }

  const current = readMetadata(parsed.changeName)

  if (current.kind === "dispatcher") {
    handleDispatcherBegin(parsed, current)
    return
  }

  if (current.kind === "release") {
    handleReleaseBegin(parsed)
    return
  }

  if (!ALLOWED_IMPLEMENT_KINDS.has(current.kind)) {
    printNonExecutableGuidance(parsed.changeName, current)
    return
  }

  handleImplementBegin(parsed, current)
}

const executedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (executedDirectly) {
  runOpenSpecBegin()
}

export {
  runOpenSpecBegin,
}
