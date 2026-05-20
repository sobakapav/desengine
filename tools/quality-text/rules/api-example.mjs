import ts from "typescript"

import { hasExportModifier, nodeBodyLineCount, walkAst } from "./utils.mjs"

export const apiExampleRule = {
  id: "api-example",
  check({ sourceFile, relativePath }) {
    if (!sourceFile) {
      return []
    }

    const violations = []

    walkAst(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && hasExportModifier(node, ts)) {
        checkExampleTag(node, sourceFile, relativePath, violations)
      }

      if (ts.isVariableStatement(node) && hasExportModifier(node, ts)) {
        for (const declaration of node.declarationList.declarations) {
          if (!declaration.initializer) {
            continue
          }

          if (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) {
            checkExampleTag(declaration.initializer, sourceFile, relativePath, violations)
          }
        }
      }
    })

    return violations
  },
}

function checkExampleTag(node, sourceFile, relativePath, violations) {
  const paramsCount = node.parameters?.length ?? 0
  const codeLines = nodeBodyLineCount(sourceFile, node)
  const isNonTrivial = paramsCount >= 2 || codeLines >= 20 || Boolean(node.typeParameters?.length)

  if (!isNonTrivial) {
    return
  }

  const tags = ts.getJSDocTags(node)
  const hasExample = tags.some((tag) => tag.tagName.getText(sourceFile) === "example")

  if (hasExample) {
    return
  }

  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))

  violations.push({
    file: relativePath,
    line: position.line + 1,
    rule: apiExampleRule.id,
    message: "Нетривиальный экспортируемый API должен содержать JSDoc-тег @example.",
  })
}
