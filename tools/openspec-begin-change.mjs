import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const ALLOWED_IMPLEMENT_KINDS = new Set(["implement", "fix"])

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
    metadataPath,
    kind: readValue("change_kind"),
    executionMode: readValue("execution_mode"),
    parentChange: readValue("parent_change"),
    strategyRoot: readValue("strategy_root"),
    roadmapRef: readValue("roadmap_ref"),
    releaseRef: readValue("release_ref"),
    verificationLevel: readValue("verification_level"),
    verificationCommand: readValue("verification_command"),
  }
}

function listChangeNames() {
  return fs
    .readdirSync(CHANGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => entry.name)
}

function releaseMembers(releaseName) {
  const members = []
  for (const changeName of listChangeNames()) {
    const meta = readMetadata(changeName)
    if (meta.releaseRef !== releaseName) {
      continue
    }
    members.push({
      name: changeName,
      kind: meta.kind,
      parentChange: meta.parentChange,
      strategyRoot: meta.strategyRoot,
    })
  }
  return members.sort((a, b) => a.name.localeCompare(b.name))
}

function updateMetadata(changeName, updates) {
  const metadataPath = path.join(CHANGES_DIR, changeName, ".openspec.yaml")
  let text = fs.readFileSync(metadataPath, "utf8")

  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}: "${String(value).replaceAll('"', '\\"')}"`
    const pattern = new RegExp(`^${key}:\\s*.*$`, "m")

    if (pattern.test(text)) {
      text = text.replace(pattern, line)
    } else {
      text = `${text.endsWith("\n") ? text : `${text}\n`}${line}\n`
    }
  }

  fs.writeFileSync(metadataPath, text, "utf8")
}

function createImplementChange(dispatcherName, implementName, description) {
  if (!implementName.startsWith("implement-") && !implementName.startsWith("fix-")) {
    throw new Error("Имя исполнительского change должно начинаться с implement- или fix-.")
  }

  const args = [path.join("tools", "create-openspec-change.mjs"), implementName]
  if (description) {
    args.push("--description", description)
  }

  const result = spawnSync("node", args, { cwd: process.cwd(), stdio: "inherit" })

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    return false
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, "utf8")
  return true
}

function ensureApplyArtifacts(changeName, description) {
  const changeDir = path.join(CHANGES_DIR, changeName)
  const summary = description?.trim() || "описание реализации будет уточнено"
  const created = []

  if (
    ensureFile(
      path.join(changeDir, "proposal.md"),
      `## Why

Нужен исполнительский change для реализации задачи диспетчера.

## What Changes

- Реализовать: ${summary}

## Impact

- Изменение закрывает конкретный исполнительский срез в рамках текущего dispatcher.
`,
    )
  ) {
    created.push("proposal.md")
  }

  if (
    ensureFile(
      path.join(changeDir, "design.md"),
      `## Контекст

- Родительский dispatcher управляет приоритетом и порядком реализации.

## Решение

- Реализация уточняется в рамках задач этого change.
`,
    )
  ) {
    created.push("design.md")
  }

  if (
    ensureFile(
      path.join(changeDir, "tasks.md"),
      `## Tasks

- [ ] 1. Уточнить постановку и границы реализации
- [ ] 2. Внести кодовые изменения
- [ ] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки
- [ ] Добавить или обновить тесты
- [ ] Зафиксировать команду проверки
- [ ] Описать mock/fixture-данные и live credentials, если нужны
`,
    )
  ) {
    created.push("tasks.md")
  }

  return created
}

function main() {
  const parsed = parseArgs(process.argv.slice(2))

  if (parsed.help) {
    printUsage()
    return
  }

  const current = readMetadata(parsed.changeName)

  if (current.kind === "dispatcher") {
    if (!parsed.spawnImplement) {
      console.error(`Change ${parsed.changeName} имеет тип dispatcher.`)
      console.error("Прямая реализация кода в dispatcher запрещена.")
      console.error("")
      console.error("Следующий шаг:")
      console.error(`- Создать implement/fix change и связать его с ${parsed.changeName}`)
      console.error(`- Пример: npm run os:begin -- ${parsed.changeName} --spawn-implement implement-<имя> --description \"...\"`)
      process.exit(2)
    }

    createImplementChange(parsed.changeName, parsed.spawnImplement, parsed.description)
    const created = readMetadata(parsed.spawnImplement)

    updateMetadata(parsed.spawnImplement, {
      parent_change: parsed.changeName,
      strategy_root: current.strategyRoot || parsed.changeName,
      release_ref: current.releaseRef || created.releaseRef,
    })
    const createdArtifacts = ensureApplyArtifacts(parsed.spawnImplement, parsed.description)

    console.log("")
    console.log(`Создан исполнительский change: ${parsed.spawnImplement}`)
    console.log(`- parent_change: ${parsed.changeName}`)
    console.log(`- strategy_root: ${current.strategyRoot || parsed.changeName}`)
    if (current.releaseRef) {
      console.log(`- release_ref: ${current.releaseRef}`)
    }
    if (createdArtifacts.length > 0) {
      console.log(`- автосозданы артефакты: ${createdArtifacts.join(", ")}`)
    }
    console.log(`Запусти: npm run os:begin -- ${parsed.spawnImplement}`)
    return
  }

  if (current.kind === "release") {
    const members = releaseMembers(parsed.changeName)
    console.log(`Release-контекст: ${parsed.changeName}`)
    console.log(`- Привязанных changes: ${members.length}`)

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

    if (grouped.size === 0) {
      console.log("- В релизе пока нет implement/fix changes")
    } else {
      console.log("- Матрица релиза (dispatcher -> implement/fix):")
      for (const [parent, list] of [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        console.log(`  ${parent}`)
        for (const item of list.sort((a, b) => a.name.localeCompare(b.name))) {
          console.log(`    ${item.name}`)
        }
      }
    }

    console.log("")
    console.log("Для новой хотелки из release-контекста:")
    console.log(`npm run os:dispatch -- ${parsed.changeName} --dispatcher <dispatcher-change> --kind fix --name <name> --description "..."`)
    return
  }

  if (!ALLOWED_IMPLEMENT_KINDS.has(current.kind)) {
    console.log(`Change ${parsed.changeName}: kind=${current.kind}, execution_mode=${current.executionMode}`)
    console.log("Это не исполнительский change. Реализацию кода запускать не нужно.")
    return
  }

  console.log(`Готово к реализации: ${parsed.changeName}`)
  console.log(`- kind: ${current.kind}`)
  console.log(`- parent_change: ${current.parentChange || "(не задан)"}`)
  console.log(`- strategy_root: ${current.strategyRoot || "(не задан)"}`)
  console.log(`- verification_level: ${current.verificationLevel || "(не задан)"}`)
  console.log(`- verification_command: ${current.verificationCommand || "(не задан)"}`)
}

main()
