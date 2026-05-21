import fs from "node:fs"
import path from "node:path"

export const HANDOFF_FILE = "handoff.md"
export const HANDOFF_PLACEHOLDER = "[заполнить]"

const REQUIRED_SECTIONS = [
  "## Миссия",
  "## Унаследованный контекст",
  "## Обязательные источники",
  "## Границы исполнения",
  "## Проверка результата",
  "## Открытые вопросы",
]

function headingPattern(sectionTitle) {
  return new RegExp(`^${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m")
}

function sectionBody(source, heading, nextHeadings) {
  const startMatch = source.match(headingPattern(heading))
  if (!startMatch || typeof startMatch.index !== "number") {
    return ""
  }

  const start = startMatch.index + startMatch[0].length
  const tail = source.slice(start)
  let end = tail.length

  for (const candidate of nextHeadings) {
    const match = tail.match(headingPattern(candidate))
    if (match && typeof match.index === "number" && match.index < end) {
      end = match.index
    }
  }

  return tail.slice(0, end).trim()
}

/**
 * @example
 * ```js
 * const source = buildHandoffTemplate({
 *   changeName: "implement-foo",
 *   parentChange: "dispatcher-bar",
 *   verificationCommand: "npm run test:unit",
 * })
 * ```
 */
export function buildHandoffTemplate({
  changeName,
  summary = "",
  parentChange = "",
  strategyRoot = "",
  releaseRef = "",
  producerRef = "",
  verificationLevel = "",
  verificationCommand = "",
} = {}) {
  const effectiveSummary = summary.trim() || HANDOFF_PLACEHOLDER
  const inheritedContext = [
    `- parent_change: ${parentChange || HANDOFF_PLACEHOLDER}`,
    `- strategy_root: ${strategyRoot || HANDOFF_PLACEHOLDER}`,
    `- release_ref: ${releaseRef || "(не задан)"}`,
    `- producer_ref: ${producerRef || "(не задан)"}`,
    `- Что из родительского change уже решено: ${HANDOFF_PLACEHOLDER}`,
    `- Кто отвечает за стратегию, тактику и приёмку результата: ${HANDOFF_PLACEHOLDER}`,
  ].join("\n")
  const requiredSources = [
    parentChange ? `- openspec/changes/${parentChange}/proposal.md` : `- ${HANDOFF_PLACEHOLDER}`,
    parentChange ? `- openspec/changes/${parentChange}/design.md` : `- ${HANDOFF_PLACEHOLDER}`,
    parentChange ? `- openspec/changes/${parentChange}/tasks.md` : `- ${HANDOFF_PLACEHOLDER}`,
    `- Какие ещё файлы и спецификации обязательны к чтению для ${changeName}: ${HANDOFF_PLACEHOLDER}`,
  ].join("\n")
  const verification = [
    `- verification_level: ${verificationLevel || HANDOFF_PLACEHOLDER}`,
    `- verification_command: ${verificationCommand || HANDOFF_PLACEHOLDER}`,
    `- Что именно должен доказать результат проверки: ${HANDOFF_PLACEHOLDER}`,
  ].join("\n")

  return `## Миссия

- Что должен изменить этот change: ${effectiveSummary}
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

${inheritedContext}

## Обязательные источники

${requiredSources}

## Границы исполнения

- Что входит в этот change: ${HANDOFF_PLACEHOLDER}
- Что сознательно не входит в этот change: ${HANDOFF_PLACEHOLDER}
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: ${HANDOFF_PLACEHOLDER}

## Проверка результата

${verification}

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: ${HANDOFF_PLACEHOLDER}
`
}

/**
 * @example
 * ```js
 * ensureHandoffFile("openspec/changes/implement-foo", {
 *   changeName: "implement-foo",
 *   parentChange: "dispatcher-bar",
 * })
 * ```
 */
export function ensureHandoffFile(changeDir, handoffContext = {}) {
  const handoffPath = path.join(changeDir, HANDOFF_FILE)
  if (fs.existsSync(handoffPath)) {
    return false
  }

  fs.writeFileSync(handoffPath, buildHandoffTemplate(handoffContext), "utf8")
  return true
}

/**
 * @example
 * ```js
 * writeHandoffFile("openspec/changes/implement-foo", {
 *   changeName: "implement-foo",
 *   summary: "собрать handoff для исполнителя",
 * })
 * ```
 */
export function writeHandoffFile(changeDir, handoffContext = {}) {
  const handoffPath = path.join(changeDir, HANDOFF_FILE)
  fs.writeFileSync(handoffPath, buildHandoffTemplate(handoffContext), "utf8")
  return handoffPath
}

/**
 * @example
 * ```js
 * const readiness = getHandoffReadiness("openspec/changes/implement-foo")
 * console.log(readiness.ready)
 * ```
 */
export function getHandoffReadiness(changeDir) {
  const handoffPath = path.join(changeDir, HANDOFF_FILE)
  if (!fs.existsSync(handoffPath)) {
    return {
      ready: false,
      filePath: handoffPath,
      errors: [`Отсутствует ${HANDOFF_FILE}`],
    }
  }

  const source = fs.readFileSync(handoffPath, "utf8")
  const errors = []

  if (source.includes(HANDOFF_PLACEHOLDER)) {
    errors.push(`В ${HANDOFF_FILE} остались плейсхолдеры ${HANDOFF_PLACEHOLDER}`)
  }

  for (let index = 0; index < REQUIRED_SECTIONS.length; index += 1) {
    const section = REQUIRED_SECTIONS[index]
    if (!headingPattern(section).test(source)) {
      errors.push(`В ${HANDOFF_FILE} отсутствует секция ${section}`)
      continue
    }

    const body = sectionBody(source, section, REQUIRED_SECTIONS.slice(index + 1))
    if (!body) {
      errors.push(`Секция ${section} в ${HANDOFF_FILE} не заполнена`)
    }
  }

  return {
    ready: errors.length === 0,
    filePath: handoffPath,
    errors,
  }
}
