import ts from "typescript"

import { walkAst } from "./utils.mjs"

export const floatingPromiseRule = {
  id: "floating-promise",
  check({ sourceFile, relativePath, checker }) {
    if (!sourceFile || !checker) {
      return []
    }

    const violations = []

    walkAst(sourceFile, (node) => {
      if (ts.isExpressionStatement(node)) {
        checkFloatingPromise(node, checker, sourceFile, relativePath, violations)
      }
    })

    return violations
  },
}

function checkFloatingPromise(node, checker, sourceFile, relativePath, violations) {
  const expression = node.expression

  if (ts.isVoidExpression(expression)) {
    return
  }

  if (!ts.isCallExpression(expression) && !ts.isNewExpression(expression)) {
    return
  }

  if (ts.isCallExpression(expression) && ts.isPropertyAccessExpression(expression.expression)) {
    const methodName = expression.expression.name.getText(sourceFile)

    if (methodName === "catch" || methodName === "finally") {
      return
    }
  }

  const signature = checker.getResolvedSignature(expression)
  const returnType = signature ? checker.getReturnTypeOfSignature(signature) : checker.getTypeAtLocation(expression)

  if (!isPromiseLikeType(returnType, checker)) {
    return
  }

  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  violations.push({
    file: relativePath,
    line: position.line + 1,
    rule: floatingPromiseRule.id,
    message: "Promise вызван без await/void или явной обработки catch/finally.",
  })
}

function isPromiseLikeType(type, checker) {
  if (!type) {
    return false
  }

  const thenProperty = type.getProperty("then")

  if (!thenProperty) {
    return false
  }

  const thenType = checker.getTypeOfSymbolAtLocation(thenProperty, thenProperty.valueDeclaration ?? thenProperty.declarations?.[0])
  return thenType.getCallSignatures().length > 0
}
