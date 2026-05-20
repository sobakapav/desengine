export function countCodeLines(text) {
  const lines = text.split(/\r?\n/)
  let inBlockComment = false
  let count = 0

  for (const line of lines) {
    let sanitized = ""

    for (let index = 0; index < line.length; index += 1) {
      const current = line[index]
      const next = line[index + 1]

      if (inBlockComment) {
        if (current === "*" && next === "/") {
          inBlockComment = false
          index += 1
        }
        continue
      }

      if (current === "/" && next === "*") {
        inBlockComment = true
        index += 1
        continue
      }

      if (current === "/" && next === "/") {
        break
      }

      sanitized += current
    }

    if (sanitized.trim().length > 0) {
      count += 1
    }
  }

  return count
}

export function nodeBodyLineCount(sourceFile, node) {
  if (!node.body) {
    return 0
  }

  const bodyText = node.body.getText(sourceFile)
  const innerBody = bodyText.startsWith("{") && bodyText.endsWith("}") ? bodyText.slice(1, -1) : bodyText
  return countCodeLines(innerBody)
}

export function hasExportModifier(node, ts) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
}

export function walkAst(node, visit) {
  visit(node)
  node.forEachChild((child) => walkAst(child, visit))
}
