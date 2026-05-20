export const todoFormatRule = {
  id: "todo-format",
  check({ relativePath, text }) {
    const violations = []
    const lines = text.split(/\r?\n/)
    const requiredFormat = /\b(?:TODO|FIXME)\(owner:[^,\)]+,\s*targetStage:[^\)]+\):/i

    lines.forEach((line, index) => {
      if (!/\b(?:TODO|FIXME)\b/.test(line)) {
        return
      }

      const trimmed = line.trim()
      const isCommentLine = trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")

      if (!isCommentLine || requiredFormat.test(line)) {
        return
      }

      violations.push({
        file: relativePath,
        line: index + 1,
        rule: todoFormatRule.id,
        message: "TODO/FIXME должен иметь формат TODO(owner:<имя>, targetStage:<этап>): описание",
      })
    })

    return violations
  },
}
