import fs from "node:fs"
import path from "node:path"

const projectRoot = process.cwd()
const specsRoot = path.join(projectRoot, "openspec", "specs")
const testsRoot = path.join(projectRoot, "test")
const coveragePlanPath = path.join(testsRoot, "traceability", "coverage-plan.json")

const TEST_FILE_PATTERN = /\.(?:test|spec)\.(?:js|jsx|mjs|ts|tsx)$/
const SCENARIO_PATTERN = /^#### Scenario:\s*(.+?)\s*$/gm
const CAPABILITY_PATTERN = /^\s*\/\/\s*@openSpec\s+capability:\s*([a-z0-9-]+)\s*$/i
const SCENARIO_ITEM_PATTERN = /^\s*\/\/\s*@openSpec\s+-\s*"(.+)"\s*$/i
const SHORT_PATTERN = /^short:\s*(.+)\s*$/m
const CHANGE_KIND_PATTERN = /^change_kind:\s*(.+)\s*$/m
const EXECUTION_MODE_PATTERN = /^execution_mode:\s*(.+)\s*$/m
const PARENT_CHANGE_PATTERN = /^parent_change:\s*(.+)\s*$/m
const ROADMAP_REF_PATTERN = /^roadmap_ref:\s*(.+)\s*$/m

const CHANGE_KINDS = new Set(["focus", "idea", "research", "dispatcher", "implement"])
const EXECUTION_MODES = new Set(["no-code", "code"])
const GOVERNED_PREFIXES = ["focus", "idea", "research", "dispatcher", "implement"]

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

function walkFiles(dirPath, predicate, result = []) {
  if (!fs.existsSync(dirPath)) {
    return result
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      walkFiles(entryPath, predicate, result)
      continue
    }

    if (entry.isFile() && predicate(entryPath)) {
      result.push(entryPath)
    }
  }

  return result
}

function readSpecs() {
  const specs = new Map()

  for (const entry of fs.readdirSync(specsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    const specPath = path.join(specsRoot, entry.name, "spec.md")

    if (!fs.existsSync(specPath)) {
      continue
    }

    const content = readText(specPath)
    const scenarios = [...content.matchAll(SCENARIO_PATTERN)].map((match) => match[1].trim())
    specs.set(entry.name, {
      path: specPath,
      scenarios: new Set(scenarios),
    })
  }

  return specs
}

function readCoveragePlan() {
  if (!fs.existsSync(coveragePlanPath)) {
    return {}
  }

  const parsed = JSON.parse(readText(coveragePlanPath))
  return parsed.uncoveredCapabilities || {}
}

function parseTestMetadata(filePath) {
  const records = []
  let current = null

  for (const line of readText(filePath).split(/\r?\n/)) {
    const capabilityMatch = line.match(CAPABILITY_PATTERN)

    if (capabilityMatch) {
      current = {
        capability: capabilityMatch[1],
        scenarios: [],
        filePath,
      }
      records.push(current)
      continue
    }

    const scenarioMatch = line.match(SCENARIO_ITEM_PATTERN)

    if (scenarioMatch && current) {
      current.scenarios.push(scenarioMatch[1])
    }
  }

  return records
}

function relative(filePath) {
  return path.relative(projectRoot, filePath)
}

function readChangeDirs(changesDir) {
  if (!fs.existsSync(changesDir)) {
    return []
  }

  return fs
    .readdirSync(changesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => path.join(changesDir, entry.name))
}

function parseShortFromMetadata(metadataText) {
  const match = metadataText.match(SHORT_PATTERN)

  if (!match) {
    return null
  }

  return match[1].trim().replace(/^["']|["']$/g, "")
}

function parseMetadataValue(metadataText, pattern) {
  const match = metadataText.match(pattern)

  if (!match) {
    return null
  }

  return match[1].trim().replace(/^["']|["']$/g, "")
}

function validateShortRules(value) {
  if (!value) {
    return []
  }

  const violations = []

  if (!/^\p{Ll}/u.test(value)) {
    violations.push("должно начинаться с маленькой буквы")
  }

  if (value.length > 75) {
    violations.push("должно быть не длиннее 75 символов")
  }

  if (/\p{P}$/u.test(value)) {
    violations.push("не должно заканчиваться знаком препинания")
  }

  return violations
}

function validateChangeKindRules(changeName, metadata, allChangeNames, changeKindsByName) {
  const errors = []
  const changeKind = parseMetadataValue(metadata, CHANGE_KIND_PATTERN)
  const executionMode = parseMetadataValue(metadata, EXECUTION_MODE_PATTERN)
  const parentChange = parseMetadataValue(metadata, PARENT_CHANGE_PATTERN) || ""
  const roadmapRef = parseMetadataValue(metadata, ROADMAP_REF_PATTERN) || ""
  const namePrefix = changeName.split("-", 1)[0]
  const nameHasGovernedPrefix = GOVERNED_PREFIXES.includes(namePrefix)

  if (/-[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(changeName)) {
    errors.push(`${changeName}: суффикс даты в имени change не допускается`)
  }

  if (!changeKind) {
    errors.push(`${changeName}: отсутствует обязательное поле change_kind`)
    return errors
  }

  if (!CHANGE_KINDS.has(changeKind)) {
    errors.push(`${changeName}: change_kind должен быть одним из focus/idea/research/dispatcher/implement`)
  }

  if (nameHasGovernedPrefix && changeKind !== namePrefix) {
    errors.push(`${changeName}: префикс имени ${namePrefix}- должен совпадать с change_kind=${changeKind}`)
  }

  if (!CHANGE_KINDS.has(changeKind)) {
    errors.push(`${changeName}: change_kind вне поддерживаемого набора`)
  }

  if (!executionMode) {
    errors.push(`${changeName}: отсутствует обязательное поле execution_mode`)
  } else if (!EXECUTION_MODES.has(executionMode)) {
    errors.push(`${changeName}: execution_mode должен быть no-code или code`)
  }

  if (parentChange && !allChangeNames.has(parentChange)) {
    errors.push(`${changeName}: parent_change ссылается на неизвестный change: ${parentChange}`)
  }

  if (changeKind === "idea") {
    if (parentChange && changeKindsByName.has(parentChange) && changeKindsByName.get(parentChange) !== "focus") {
      errors.push(`${changeName}: idea change может иметь parent_change только на focus`)
    }
    if (executionMode && executionMode !== "no-code") {
      errors.push(`${changeName}: idea change должен иметь execution_mode=no-code`)
    }
  }

  if (changeKind === "focus") {
    if (parentChange) {
      errors.push(`${changeName}: focus change не должен иметь parent_change`)
    }
    if (executionMode && executionMode !== "no-code") {
      errors.push(`${changeName}: focus change должен иметь execution_mode=no-code`)
    }
  }

  if (changeKind === "research") {
    if (executionMode && executionMode !== "no-code") {
      errors.push(`${changeName}: research change должен иметь execution_mode=no-code`)
    }
    if (
      parentChange &&
      changeKindsByName.has(parentChange) &&
      !["focus", "idea", "research"].includes(changeKindsByName.get(parentChange))
    ) {
      errors.push(`${changeName}: research change может иметь parent_change только на стратегический change`)
    }
  }

  if (changeKind === "dispatcher") {
    if (!parentChange) {
      errors.push(`${changeName}: dispatcher change должен иметь parent_change`)
    }
    if (!roadmapRef) {
      errors.push(`${changeName}: dispatcher change должен иметь roadmap_ref`)
    }
    if (executionMode && executionMode !== "no-code") {
      errors.push(`${changeName}: dispatcher change должен иметь execution_mode=no-code`)
    }
  }

  if (changeKind === "implement") {
    if (!parentChange) {
      errors.push(`${changeName}: implement change должен иметь parent_change`)
    }
    if (executionMode && executionMode !== "code") {
      errors.push(`${changeName}: implement change должен иметь execution_mode=code`)
    }
  }

  return errors
}

const specs = readSpecs()
const coveragePlan = readCoveragePlan()
const testFiles = walkFiles(testsRoot, (filePath) => TEST_FILE_PATTERN.test(filePath))
const records = testFiles.flatMap(parseTestMetadata)
const coveredScenarios = new Map()
const errors = []
const changesRoot = path.join(projectRoot, "openspec", "changes")
const allChanges = new Set(readChangeDirs(changesRoot).map((dirPath) => path.basename(dirPath)))
const changeKindsByName = new Map()

for (const changeDir of readChangeDirs(changesRoot)) {
  const metadataPath = path.join(changeDir, ".openspec.yaml")

  if (!fs.existsSync(metadataPath)) {
    continue
  }

  const metadata = readText(metadataPath)
  const changeName = path.basename(changeDir)
  const changeKind = parseMetadataValue(metadata, CHANGE_KIND_PATTERN)

  if (changeKind) {
    changeKindsByName.set(changeName, changeKind)
  }
}

for (const [capability, entry] of Object.entries(coveragePlan)) {
  if (!specs.has(capability)) {
    errors.push(`coverage-plan ссылается на неизвестный capability: ${capability}`)
  }

  for (const field of ["priority", "reason", "targetStage"]) {
    if (!entry[field]) {
      errors.push(`coverage-plan.${capability} не содержит поле ${field}`)
    }
  }
}

for (const changeDir of readChangeDirs(changesRoot)) {
  const metadataPath = path.join(changeDir, ".openspec.yaml")

  if (!fs.existsSync(metadataPath)) {
    continue
  }

  const metadata = readText(metadataPath)
  const short = parseShortFromMetadata(metadata)
  const violations = validateShortRules(short)
  const changeName = path.basename(changeDir)

  for (const violation of violations) {
    errors.push(`${relative(metadataPath)}: short ${violation}`)
  }

  for (const violation of validateChangeKindRules(changeName, metadata, allChanges, changeKindsByName)) {
    errors.push(`${relative(metadataPath)}: ${violation}`)
  }
}

for (const record of records) {
  const spec = specs.get(record.capability)

  if (!spec) {
    errors.push(`${relative(record.filePath)} ссылается на неизвестный capability: ${record.capability}`)
    continue
  }

  if (record.scenarios.length === 0) {
    errors.push(`${relative(record.filePath)} (${record.capability}) не содержит @openSpec scenario`)
    continue
  }

  const covered = coveredScenarios.get(record.capability) || new Set()
  coveredScenarios.set(record.capability, covered)

  for (const scenario of record.scenarios) {
    if (!spec.scenarios.has(scenario)) {
      errors.push(`${relative(record.filePath)} (${record.capability}) ссылается на неизвестный scenario: ${scenario}`)
      continue
    }

    covered.add(scenario)
  }
}

const coverageRows = []

for (const [capability, spec] of specs.entries()) {
  const covered = coveredScenarios.get(capability) || new Set()
  const uncoveredCount = spec.scenarios.size - covered.size
  const planned = Boolean(coveragePlan[capability])

  if (uncoveredCount > 0 && !planned) {
    errors.push(
      `${capability}: покрыто ${covered.size}/${spec.scenarios.size}, но capability не внесён в coverage-plan`,
    )
  }

  coverageRows.push({
    capability,
    covered: covered.size,
    total: spec.scenarios.size,
    planned,
  })
}

console.log("OpenSpec traceability report")
console.log(`Specs: ${specs.size}`)
console.log(`Test files with @openSpec metadata: ${new Set(records.map((record) => record.filePath)).size}`)
console.log("")

for (const row of coverageRows.sort((left, right) => left.capability.localeCompare(right.capability))) {
  const planLabel = row.planned ? "coverage-plan" : "ready"
  console.log(`- ${row.capability}: ${row.covered}/${row.total} scenarios (${planLabel})`)
}

if (errors.length > 0) {
  console.error("")
  console.error("Traceability errors:")

  for (const error of errors) {
    console.error(`- ${error}`)
  }

  process.exit(1)
}

console.log("")
console.log("Traceability metadata is valid.")
