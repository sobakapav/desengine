import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import ts from "typescript"

const projectRoot = process.cwd()
const subsystemRoot = path.join(projectRoot, "tools", "quality-text")
const configPath = path.join(subsystemRoot, "config.json")
const primaryWaiversPath = path.join(subsystemRoot, "waivers.json")
const legacyWaiversPath = path.join(projectRoot, "test", "traceability", "readability-waivers.json")
const supportedExtensions = new Set([".ts", ".tsx", ".js", ".mjs"])
const trackedRoots = ["app", "components", "lib", "hooks", "tools", "test"]
const defaultConfig = {
  maxLinesProduction: 300,
  maxLinesTests: 450,
  maxFunctionLines: 60,
  scopes: ["working", "branch", "repo"],
}
const config = readConfig()

const args = parseArgs(process.argv.slice(2))
const scope = args.scope ?? config.scopes[0] ?? "working"

function parseArgs(argv) {
  const parsed = {}

  for (const arg of argv) {
    if (arg.startsWith("--scope=")) {
      parsed.scope = arg.slice("--scope=".length)
    }
  }

  return parsed
}

function readConfig() {
  if (!fs.existsSync(configPath)) {
    return defaultConfig
  }

  const parsed = JSON.parse(fs.readFileSync(configPath, "utf8"))

  return {
    ...defaultConfig,
    ...parsed,
  }
}

function run(command) {
  return execSync(command, { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim()
}

function hasGitRef(ref) {
  try {
    run(`git rev-parse --verify ${ref}`)
    return true
  } catch {
    return false
  }
}

function resolveComparisonBase() {
  const explicitRef = process.env.QUALITY_TEXT_BASE_REF ?? process.env.READABILITY_BASE_REF

  if (explicitRef && hasGitRef(explicitRef)) {
    return run(`git merge-base HEAD ${explicitRef}`)
  }

  const candidates = ["origin/main", "origin/master", "main", "master"]

  for (const candidate of candidates) {
    if (!hasGitRef(candidate)) {
      continue
    }

    try {
      return run(`git merge-base HEAD ${candidate}`)
    } catch {
      // next candidate
    }
  }

  try {
    return run("git rev-parse HEAD~1")
  } catch {
    return null
  }
}

function splitLines(output) {
  if (!output) {
    return []
  }

  return output
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean)
}

function isTrackedSourceFile(relativePath) {
  const extension = path.extname(relativePath)

  if (!supportedExtensions.has(extension)) {
    return false
  }

  if (relativePath.endsWith(".d.ts")) {
    return false
  }

  const normalized = relativePath.replaceAll("\\", "/")

  return trackedRoots.some((rootDir) => normalized === rootDir || normalized.startsWith(`${rootDir}/`))
}

function resolveScopeFiles() {
  if (scope === "repo") {
    const files = []

    for (const rootDir of trackedRoots) {
      const absoluteRoot = path.join(projectRoot, rootDir)

      if (!fs.existsSync(absoluteRoot)) {
        continue
      }

      walkFiles(absoluteRoot, files)
    }

    return files
  }

  const changed = new Set()

  if (scope === "branch") {
    const base = resolveComparisonBase()

    if (base) {
      for (const filePath of splitLines(run(`git diff --name-only --diff-filter=ACMR ${base}...HEAD`))) {
        changed.add(filePath)
      }
    }
  }

  for (const filePath of splitLines(run("git diff --name-only --diff-filter=ACMR"))) {
    changed.add(filePath)
  }

  for (const filePath of splitLines(run("git diff --name-only --cached --diff-filter=ACMR"))) {
    changed.add(filePath)
  }

  return [...changed]
    .filter(isTrackedSourceFile)
    .map((relativePath) => path.join(projectRoot, relativePath))
    .filter((absolutePath) => fs.existsSync(absolutePath))
}

function walkFiles(dirPath, result) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolutePath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      walkFiles(absolutePath, result)
      continue
    }

    const relativePath = path.relative(projectRoot, absolutePath)

    if (entry.isFile() && isTrackedSourceFile(relativePath)) {
      result.push(absolutePath)
    }
  }
}

function isTestOrStoryFile(filePath) {
  const normalized = filePath.replaceAll("\\", "/")
  return (
    normalized.includes("/test/") ||
    normalized.includes("/__tests__/") ||
    normalized.includes("/stories/") ||
    /\.(?:test|spec|stories)\.(?:ts|tsx|js|mjs)$/.test(normalized)
  )
}

function countCodeLines(text) {
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

function nodeBodyLineCount(sourceFile, node) {
  if (!node.body) {
    return 0
  }

  const bodyText = node.body.getText(sourceFile)
  const innerBody = bodyText.startsWith("{") && bodyText.endsWith("}") ? bodyText.slice(1, -1) : bodyText
  return countCodeLines(innerBody)
}

function hasExportModifier(node) {
  return Boolean(node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword))
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

function findReadabilityViolations(files) {
  const violations = []
  const tsConfigPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, "tsconfig.json")
  const parsedConfig = tsConfigPath
    ? ts.parseJsonConfigFileContent(ts.readConfigFile(tsConfigPath, ts.sys.readFile).config, ts.sys, projectRoot)
    : null

  const compilerOptions = parsedConfig?.options ?? {
    allowJs: true,
    checkJs: true,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
  }

  const program = ts.createProgram({
    rootNames: parsedConfig?.fileNames ?? files,
    options: compilerOptions,
  })
  const checker = program.getTypeChecker()
  const fileSet = new Set(files.map((filePath) => path.resolve(filePath)))

  for (const absolutePath of files) {
    const relativePath = path.relative(projectRoot, absolutePath)
    const text = fs.readFileSync(absolutePath, "utf8")
    const codeLines = countCodeLines(text)
    const isTestFile = isTestOrStoryFile(absolutePath)
    const maxLines = isTestFile ? config.maxLinesTests : config.maxLinesProduction

    if (codeLines > maxLines) {
      violations.push({
        file: relativePath,
        rule: "file-length",
        message: `Файл содержит ${codeLines} строк кода при лимите ${maxLines}. Разбейте на модули или зафиксируйте временное исключение.`,
      })
    }

    checkTodoFixmeViolations(relativePath, text, violations)

    const sourceFile = program.getSourceFile(absolutePath)

    if (!sourceFile || !fileSet.has(path.resolve(sourceFile.fileName))) {
      continue
    }

    walkAst(sourceFile, (node) => {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isArrowFunction(node) ||
        ts.isFunctionExpression(node)
      ) {
        const functionCodeLines = nodeBodyLineCount(sourceFile, node)

        if (!isTestFile && functionCodeLines > config.maxFunctionLines) {
          const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
          violations.push({
            file: relativePath,
            line: position.line + 1,
            rule: "function-length",
            message: `Функция содержит ${functionCodeLines} строк кода при лимите ${config.maxFunctionLines}.`,
          })
        }
      }

      if (ts.isFunctionDeclaration(node) && hasExportModifier(node)) {
        checkBooleanTrap(node.parameters, sourceFile, relativePath, violations)
        checkExampleTag(node, sourceFile, relativePath, violations)
      }

      if (ts.isVariableStatement(node) && hasExportModifier(node)) {
        for (const declaration of node.declarationList.declarations) {
          if (!declaration.initializer) {
            continue
          }

          if (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) {
            checkBooleanTrap(declaration.initializer.parameters, sourceFile, relativePath, violations)
            checkExampleTag(declaration.initializer, sourceFile, relativePath, violations)
          }
        }
      }

      if (ts.isExpressionStatement(node)) {
        checkFloatingPromise(node, checker, sourceFile, relativePath, violations)
      }
    })
  }

  return violations
}

function readWaivers() {
  const waiversPath = fs.existsSync(primaryWaiversPath) ? primaryWaiversPath : legacyWaiversPath

  if (!fs.existsSync(waiversPath)) {
    return {}
  }

  const parsed = JSON.parse(fs.readFileSync(waiversPath, "utf8"))
  const entries = parsed.waivers ?? {}
  const errors = []

  for (const [filePath, entry] of Object.entries(entries)) {
    if (!Array.isArray(entry.rules) || entry.rules.length === 0) {
      errors.push(`${filePath}: поле rules должно быть непустым массивом`)
    }

    for (const field of ["owner", "reason", "targetStage"]) {
      if (!entry[field]) {
        errors.push(`${filePath}: отсутствует поле ${field}`)
      }
    }
  }

  if (errors.length > 0) {
    console.error(`${path.relative(projectRoot, waiversPath)} содержит ошибки:`)
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  return entries
}

function isWaived(violation, waivers) {
  const entry = waivers[violation.file]

  if (!entry) {
    return false
  }

  return entry.rules.includes(violation.rule)
}

function checkTodoFixmeViolations(relativePath, text, violations) {
  const lines = text.split(/\r?\n/)
  const requiredFormat = /\b(?:TODO|FIXME)\(owner:[^,\)]+,\s*targetStage:[^\)]+\):/i

  lines.forEach((line, index) => {
    if (!/\b(?:TODO|FIXME)\b/.test(line)) {
      return
    }

    const trimmed = line.trim()
    const isCommentLine = trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")

    if (!isCommentLine) {
      return
    }

    if (requiredFormat.test(line)) {
      return
    }

    violations.push({
      file: relativePath,
      line: index + 1,
      rule: "todo-format",
      message: "TODO/FIXME должен иметь формат TODO(owner:<имя>, targetStage:<этап>): описание",
    })
  })
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
      rule: "boolean-trap",
      message: `Параметр '${parameterName}' имеет boolean-тип. Используйте объект параметров или отдельные явные методы.`,
    })
  }
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
    rule: "api-example",
    message: "Нетривиальный экспортируемый API должен содержать JSDoc-тег @example.",
  })
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
    rule: "floating-promise",
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

function walkAst(node, visit) {
  visit(node)
  node.forEachChild((child) => walkAst(child, visit))
}

const files = resolveScopeFiles()

if (files.length === 0) {
  console.log("Code Quality Text report")
  console.log("Проверяемых файлов не найдено для текущего scope.")
  process.exit(0)
}

const waivers = readWaivers()
const violations = findReadabilityViolations(files)
const activeViolations = violations.filter((violation) => !isWaived(violation, waivers))
const waivedCount = violations.length - activeViolations.length

console.log("Code Quality Text report")
console.log(`Scope: ${scope}`)
console.log(`Проверено файлов: ${files.length}`)
console.log(`Нарушений в waiver: ${waivedCount}`)

if (activeViolations.length === 0) {
  console.log("Нарушений не найдено.")
  process.exit(0)
}

console.error("")
console.error("Нарушения code-quality-text:")

for (const violation of activeViolations) {
  const location = violation.line ? `${violation.file}:${violation.line}` : violation.file
  console.error(`- [${violation.rule}] ${location} — ${violation.message}`)
}

process.exit(1)
