import { countCodeLines } from "./utils.mjs"

export const fileLengthRule = {
  id: "file-length",
  check({ relativePath, text, isTestFile, config }) {
    const codeLines = countCodeLines(text)
    const maxLines = isTestFile ? config.maxLinesTests : config.maxLinesProduction

    if (codeLines <= maxLines) {
      return []
    }

    return [
      {
        file: relativePath,
        rule: fileLengthRule.id,
        message: `Файл содержит ${codeLines} строк кода при лимите ${maxLines}. Разбейте на модули или зафиксируйте временное исключение.`,
      },
    ]
  },
}
