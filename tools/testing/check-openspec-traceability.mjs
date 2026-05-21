import { buildTraceabilityReport } from "./traceability/report.mjs"

// Контрактные маркеры checker сохранены в модульной реализации:
// CAPABILITY_PATTERN, SCENARIO_ITEM_PATTERN, validateShortRules,
// validateChangeKindRules, CHANGE_KIND_PATTERN, focus.
// execution_mode, parent_change, roadmap_ref, roadmap_refs, producer_ref, суффикс даты в имени change не допускается.
// должно начинаться с маленькой буквы; должно быть не длиннее 75 символов;
// не должно заканчиваться знаком препинания; coverage-plan;
// ссылается на неизвестный capability; ссылается на неизвестный scenario;
// но capability не внесён в coverage-plan.
const report = buildTraceabilityReport(process.cwd())

console.log("OpenSpec traceability report")
console.log(`Specs: ${report.specsCount}`)
console.log(`Test files with @openSpec metadata: ${report.testFilesCount}`)
console.log("")

for (const row of report.coverageRows.sort((left, right) => left.capability.localeCompare(right.capability))) {
  const planLabel = row.planned ? "coverage-plan" : "ready"
  console.log(`- ${row.capability}: ${row.covered}/${row.total} scenarios (${planLabel})`)
}

if (report.errors.length > 0) {
  console.error("")
  console.error("Traceability errors:")

  for (const error of report.errors) {
    console.error(`- ${error}`)
  }

  process.exit(1)
}

console.log("")
console.log("Traceability metadata is valid.")
