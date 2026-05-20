import ts from "typescript"

import { nodeBodyLineCount, walkAst } from "./utils.mjs"

export const functionLengthRule = {
  id: "function-length",
  check({ sourceFile, relativePath, isTestFile, config }) {
    if (!sourceFile || isTestFile) {
      return []
    }

    const violations = []

    walkAst(sourceFile, (node) => {
      if (
        !ts.isFunctionDeclaration(node) &&
        !ts.isMethodDeclaration(node) &&
        !ts.isArrowFunction(node) &&
        !ts.isFunctionExpression(node)
      ) {
        return
      }

      const functionCodeLines = nodeBodyLineCount(sourceFile, node)

      if (functionCodeLines <= config.maxFunctionLines) {
        return
      }

      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
      violations.push({
        file: relativePath,
        line: position.line + 1,
        rule: functionLengthRule.id,
        message: `Функция содержит ${functionCodeLines} строк кода при лимите ${config.maxFunctionLines}.`,
      })
    })

    return violations
  },
}
