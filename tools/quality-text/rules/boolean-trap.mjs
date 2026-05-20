import ts from "typescript"

import { hasExportModifier, walkAst } from "./utils.mjs"

export const booleanTrapRule = {
  id: "boolean-trap",
  check({ sourceFile, relativePath }) {
    if (!sourceFile) {
      return []
    }

    const violations = []

    walkAst(sourceFile, (node) => {
      if (ts.isFunctionDeclaration(node) && hasExportModifier(node, ts)) {
        checkBooleanTrap(node.parameters, sourceFile, relativePath, violations)
      }

      if (ts.isVariableStatement(node) && hasExportModifier(node, ts)) {
        for (const declaration of node.declarationList.declarations) {
          if (!declaration.initializer) {
            continue
          }

          if (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) {
            checkBooleanTrap(declaration.initializer.parameters, sourceFile, relativePath, violations)
          }
        }
      }
    })

    return violations
  },
}

function checkBooleanTrap(parameters, sourceFile, relativePath, violations) {
  for (const parameter of parameters) {
    if (!isBooleanTypeNode(parameter.type)) {
      continue
    }

    const position = sourceFile.getLineAndCharacterOfPosition(parameter.getStart(sourceFile))
    const parameterName = parameter.name.getText(sourceFile)

    violations.push({
      file: relativePath,
      line: position.line + 1,
      rule: booleanTrapRule.id,
      message: `Параметр '${parameterName}' имеет boolean-тип. Используйте объект параметров или отдельные явные методы.`,
    })
  }
}

function isBooleanTypeNode(typeNode) {
  if (!typeNode) {
    return false
  }

  if (typeNode.kind === ts.SyntaxKind.BooleanKeyword) {
    return true
  }

  if (ts.isLiteralTypeNode(typeNode)) {
    return typeNode.literal.kind === ts.SyntaxKind.TrueKeyword || typeNode.literal.kind === ts.SyntaxKind.FalseKeyword
  }

  if (ts.isUnionTypeNode(typeNode)) {
    return typeNode.types.some(isBooleanTypeNode)
  }

  return false
}
