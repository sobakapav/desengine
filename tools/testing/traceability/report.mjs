import path from "node:path"
import { relative } from "./common.mjs"
import { validateChanges } from "./changes.mjs"
import { readCoveragePlan, readSpecs, readTestRecords } from "./specs.mjs"

function validateCoveragePlan(specs, coveragePlan) {
  const errors = []

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

  return errors
}

function collectCoveredScenarios(projectRoot, specs, records) {
  const coveredScenarios = new Map()
  const errors = []

  for (const record of records) {
    const spec = specs.get(record.capability)

    if (!spec) {
      errors.push(`${relative(projectRoot, record.filePath)} ссылается на неизвестный capability: ${record.capability}`)
      continue
    }
    if (record.scenarios.length === 0) {
      errors.push(`${relative(projectRoot, record.filePath)} (${record.capability}) не содержит @openSpec scenario`)
      continue
    }

    const covered = coveredScenarios.get(record.capability) || new Set()
    coveredScenarios.set(record.capability, covered)

    for (const scenario of record.scenarios) {
      if (spec.scenarios.has(scenario)) {
        covered.add(scenario)
      } else {
        errors.push(`${relative(projectRoot, record.filePath)} (${record.capability}) ссылается на неизвестный scenario: ${scenario}`)
      }
    }
  }

  return { coveredScenarios, errors }
}

function buildCoverageRows(specs, coveredScenarios, coveragePlan) {
  const coverageRows = []
  const errors = []

  for (const [capability, spec] of specs.entries()) {
    const covered = coveredScenarios.get(capability) || new Set()
    const uncoveredCount = spec.scenarios.size - covered.size
    const planned = Boolean(coveragePlan[capability])

    if (uncoveredCount > 0 && !planned) {
      errors.push(`${capability}: покрыто ${covered.size}/${spec.scenarios.size}, но capability не внесён в coverage-plan`)
    }

    coverageRows.push({ capability, covered: covered.size, total: spec.scenarios.size, planned })
  }

  return { coverageRows, errors }
}

export function buildTraceabilityReport(projectRoot) {
  const specsRoot = path.join(projectRoot, "openspec", "specs")
  const testsRoot = path.join(projectRoot, "test")
  const coveragePlanPath = path.join(testsRoot, "traceability", "coverage-plan.json")
  const specs = readSpecs(specsRoot)
  const coveragePlan = readCoveragePlan(coveragePlanPath)
  const records = readTestRecords(testsRoot)
  const coverage = collectCoveredScenarios(projectRoot, specs, records)
  const rows = buildCoverageRows(specs, coverage.coveredScenarios, coveragePlan)
  const errors = [
    ...validateCoveragePlan(specs, coveragePlan),
    ...validateChanges(projectRoot, path.join(projectRoot, "openspec", "changes")),
    ...coverage.errors,
    ...rows.errors,
  ]

  return {
    errors,
    specsCount: specs.size,
    testFilesCount: new Set(records.map((record) => record.filePath)).size,
    coverageRows: rows.coverageRows,
  }
}
