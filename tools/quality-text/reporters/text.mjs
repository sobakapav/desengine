export function printTextReport({ scope, filesChecked, violations, waivedViolations, llmMode, activeViolations }) {
  console.log("Code Quality Text report")
  console.log(`Scope: ${scope}`)
  console.log(`Files checked: ${filesChecked}`)
  console.log(`Проверено файлов: ${filesChecked}`)
  console.log(`Violations: ${violations}`)
  console.log(`Waived violations: ${waivedViolations}`)
  console.log(`Нарушений в waiver: ${waivedViolations}`)
  console.log(`LLM mode: ${llmMode}`)

  if (filesChecked === 0) {
    console.log("Проверяемых файлов не найдено для текущего scope.")
    return
  }

  if (activeViolations.length === 0) {
    console.log("Нарушений не найдено.")
    return
  }

  console.error("")
  console.error("Нарушения code-quality-text:")

  for (const violation of activeViolations) {
    const location = violation.line ? `${violation.file}:${violation.line}` : violation.file
    console.error(`- [${violation.rule}] ${location} — ${violation.message}`)
  }
}
