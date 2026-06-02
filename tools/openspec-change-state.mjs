import fs from "node:fs"
import path from "node:path"
import { runCreateOpenSpecChange } from "./create-openspec-change.mjs"

function getChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
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

/**
 * @example
 * ```js
 * const meta = readMetadata("dispatcher-demo")
 * ```
 */
export function readMetadata(changeName) {
  const metadataPath = path.join(getChangesDir(), changeName, ".openspec.yaml")

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
    roadmapRefs: parseRoadmapRefs(text),
    releaseRef: readValue("release_ref"),
    producerRef: readValue("producer_ref"),
    verificationLevel: readValue("verification_level"),
    verificationCommand: readValue("verification_command"),
  }
}

function listChangeNames() {
  return fs
    .readdirSync(getChangesDir(), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => entry.name)
}

/**
 * @example
 * ```js
 * const members = releaseMembers("release-demo")
 * ```
 */
export function releaseMembers(releaseName) {
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

/**
 * @example
 * ```js
 * updateMetadata("implement-demo", {
 *   parent_change: "dispatcher-demo",
 *   strategy_root: "focus-demo",
 * })
 * ```
 */
export function updateMetadata(changeName, updates) {
  const metadataPath = path.join(getChangesDir(), changeName, ".openspec.yaml")
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

/**
 * @example
 * ```js
 * createImplementChange("implement-demo-task", "подготовить исполнительский change")
 * ```
 */
export function createImplementChange(implementName, description) {
  if (!implementName.startsWith("implement-") && !implementName.startsWith("fix-")) {
    throw new Error("Имя исполнительского change должно начинаться с implement- или fix-.")
  }

  const args = [implementName]
  if (description) {
    args.push("--description", description)
  }
  runCreateOpenSpecChange(args)
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    return false
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, "utf8")
  return true
}

/**
 * @example
 * ```js
 * const created = ensureApplyArtifacts("implement-demo-task", "добавить runtime-покрытие")
 * ```
 */
export function ensureApplyArtifacts(changeName, description) {
  const changeDir = path.join(getChangesDir(), changeName)
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
