import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

import { normalizeCreatedChangeName } from "./openspec-change-name.mjs"
import { ensureHandoffFile, HANDOFF_FILE } from "./openspec-handoff.mjs"

const METADATA_FILE = ".openspec.yaml"
const TASKS_FILE = "tasks.md"
const GOVERNED_PREFIXES = ["focus", "release", "idea", "producer", "dispatcher", "implement", "fix"]
const METADATA_DEFAULTS = [
  { key: "short_policy", value: "none" },
  { key: "review_sync_state", value: "none" },
  { key: "change_kind", value: "idea" },
  { key: "execution_mode", value: "no-code" },
  { key: "parent_change", value: "" },
  { key: "strategy_root", value: "" },
  { key: "roadmap_ref", value: "" },
  { key: "release_ref", value: "" },
  { key: "producer_ref", value: "" },
  { key: "verification_level", value: "" },
  { key: "verification_command", value: "" },
  { key: "issue", value: "" },
  { key: "short", value: "краткое описание change" },
]
const SHORT_DEFAULT_VALUE = "краткое описание change"
const TEST_CHECKLIST_HEADING = "## Тестовая часть change"
const TEST_CHECKLIST = `${TEST_CHECKLIST_HEADING}

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки: static/contract, unit, component/browser, integration, e2e smoke или live/provider
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: \`npm run ...\`
- [ ] Описать mock/fixture-данные и live credentials, если они нужны
- [ ] Если покрытие откладывается, добавить запись в \`test/traceability/coverage-plan.json\` с причиной и этапом закрытия
`

// Для dispatcher с несколькими inherited roadmap используется metadata-поле roadmap_refs.

function printUsage() {
  console.error("Использование:")
  console.error("  npm run openspec:new -- <change-name>")
  console.error("  npm run openspec:new -- <change-name> --schema spec-driven")
  console.error("  npm run openspec:new -- <change-name> --description \"...\"")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true }
  }

  let changeName = null
  let description = ""

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === "--schema" || arg === "--description") {
      if (arg === "--description") {
        description = argv[index + 1] || ""
      }
      index += 1
      continue
    }

    if (arg.startsWith("--schema=")) {
      continue
    }

    if (arg.startsWith("--description=")) {
      description = arg.slice("--description=".length)
      continue
    }

    if (arg.startsWith("-")) {
      continue
    }

    if (!changeName) {
      changeName = arg
    }
  }

  if (!changeName) {
    throw new Error("Не удалось определить имя change из аргументов.")
  }

  return { help: false, changeName, description }
}

function resolveKindFromName(changeName) {
  const prefix = changeName.split("-", 1)[0]

  if (!GOVERNED_PREFIXES.includes(prefix)) {
    return "idea"
  }

  return prefix
}

function normalizeShortValue(value) {
  let normalized = value.replace(/\s+/g, " ").trim().replace(/\p{P}+$/u, "")

  if (!normalized) {
    return SHORT_DEFAULT_VALUE
  }

  if (/^\p{Lu}/u.test(normalized)) {
    normalized = `${normalized.slice(0, 1).toLocaleLowerCase("ru-RU")}${normalized.slice(1)}`
  }

  if (!/^\p{Ll}/u.test(normalized)) {
    normalized = `кратко ${normalized}`
  }

  if (normalized.length > 75) {
    normalized = normalized.slice(0, 75).trim().replace(/\p{P}+$/u, "")
  }

  if (!normalized) {
    return SHORT_DEFAULT_VALUE
  }

  return normalized
}

function shortFromChangeName(changeName) {
  const withoutPrefix = changeName.replace(/^(focus|release|idea|producer|dispatcher|implement|fix)-/, "")
  return normalizeShortValue(withoutPrefix.replace(/-/g, " "))
}

function ensureMetadataFields(changeDir, changeName, descriptionHint = "") {
  const metadataPath = path.join(changeDir, METADATA_FILE)

  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Metadata-файл не найден: ${metadataPath}`)
  }

  const metadata = fs.readFileSync(metadataPath, "utf8")
  const inferredKind = resolveKindFromName(changeName)
  const inferredExecutionMode = inferredKind === "implement" || inferredKind === "fix" ? "code" : "no-code"

  let next = metadata.endsWith("\n") ? metadata : `${metadata}\n`
  let changed = false

  for (const field of METADATA_DEFAULTS) {
    const pattern = new RegExp(`^${field.key}:\\s*`, "m")

    if (pattern.test(next)) {
      continue
    }

    const serializedValue = `"${field.value.replaceAll('"', '\\"')}"`
    next = `${next}${field.key}: ${serializedValue}\n`
    changed = true
  }

  const forcedFields = [
    { key: "change_kind", value: inferredKind },
    { key: "execution_mode", value: inferredExecutionMode },
  ]

  if (inferredKind === "implement" || inferredKind === "fix") {
    forcedFields.push({ key: "verification_level", value: "unit" })
    forcedFields.push({ key: "verification_command", value: "npm run test:unit" })
  }

  for (const field of forcedFields) {
    const serializedValue = `"${field.value.replaceAll('"', '\\"')}"`
    const line = `${field.key}: ${serializedValue}`
    const pattern = new RegExp(`^${field.key}:\\s*.*$`, "m")

    if (pattern.test(next)) {
      if (!new RegExp(`^${field.key}:\\s*${serializedValue.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*$`, "m").test(next)) {
        next = next.replace(pattern, line)
        changed = true
      }
      continue
    }

    next = `${next}${line}\n`
    changed = true
  }

  const shortMatch = next.match(/^short:\s*(.+)\s*$/m)

  if (shortMatch) {
    const rawShort = shortMatch[1].trim().replace(/^["']|["']$/g, "")
    const needsReplaceDefault = !rawShort || rawShort === SHORT_DEFAULT_VALUE
    const shortSource = needsReplaceDefault
      ? descriptionHint.trim() || shortFromChangeName(changeName)
      : rawShort
    const normalizedShort = normalizeShortValue(shortSource)
    const serializedShort = `"${normalizedShort.replaceAll('"', '\\"')}"`
    const normalizedLine = `short: ${serializedShort}`

    if (shortMatch[0].trim() !== normalizedLine) {
      next = next.replace(/^short:\s*(.+)\s*$/m, normalizedLine)
      changed = true
    }
  }

  if (!changed) {
    return false
  }

  fs.writeFileSync(metadataPath, next, "utf8")
  return true
}

function ensureTestChecklist(changeDir) {
  const tasksPath = path.join(changeDir, TASKS_FILE)

  if (!fs.existsSync(tasksPath)) {
    return false
  }

  const tasks = fs.readFileSync(tasksPath, "utf8")

  if (tasks.includes(TEST_CHECKLIST_HEADING)) {
    return false
  }

  const normalized = tasks.endsWith("\n") ? tasks : `${tasks}\n`
  fs.writeFileSync(tasksPath, `${normalized}\n${TEST_CHECKLIST}`, "utf8")
  return true
}

function handoffContextFromChange(changeName, descriptionHint = "") {
  return {
    changeName,
    summary: descriptionHint.trim() || shortFromChangeName(changeName),
  }
}

function main() {
  let parsedArgs

  try {
    parsedArgs = parseArgs(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    console.error("")
    printUsage()
    process.exit(1)
  }

  if (parsedArgs.help) {
    printUsage()
    return
  }

  const normalizedChangeName = normalizeCreatedChangeName(parsedArgs.changeName)
  const cliArgs = [...process.argv.slice(2)]
  const changeNameArgIndex = cliArgs.findIndex((arg) => arg === parsedArgs.changeName)

  if (changeNameArgIndex !== -1) {
    cliArgs[changeNameArgIndex] = normalizedChangeName
  }

  const projectRoot = process.cwd()
  const changeDir = path.join(projectRoot, "openspec", "changes", normalizedChangeName)
  const result = spawnSync("openspec", ["new", "change", ...cliArgs], {
    cwd: projectRoot,
    stdio: "inherit",
  })

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }

  if (result.error) {
    throw result.error
  }

  const addedMetadata = ensureMetadataFields(changeDir, normalizedChangeName, parsedArgs.description)
  const addedTestChecklist = ensureTestChecklist(changeDir)
  const addedHandoff = ensureHandoffFile(changeDir, handoffContextFromChange(normalizedChangeName, parsedArgs.description))

  if (normalizedChangeName !== parsedArgs.changeName) {
    console.log(`Имя change нормализовано: ${parsedArgs.changeName} -> ${normalizedChangeName}`)
  }

  if (addedMetadata) {
    console.log(`Обновлены поля metadata в ${path.relative(projectRoot, path.join(changeDir, METADATA_FILE))}`)
  }

  if (addedTestChecklist) {
    console.log(`Добавлен тестовый чеклист в ${path.relative(projectRoot, path.join(changeDir, TASKS_FILE))}`)
  }

  if (addedHandoff) {
    console.log(`Добавлен handoff-артефакт в ${path.relative(projectRoot, path.join(changeDir, HANDOFF_FILE))}`)
  }
}

main()
