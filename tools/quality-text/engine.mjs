import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import ts from "typescript"

import { printTextReport } from "./reporters/text.mjs"
import { qualityTextRuleIds, qualityTextRules } from "./rules/index.mjs"

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
  llm: {
    mode: "off",
    maxFiles: 5,
    maxTokens: 8000,
    fallback: "deterministic",
  },
}
const config = readConfig()

const args = parseArgs(process.argv.slice(2))
const scope = args.scope ?? config.scopes[0] ?? "working"

function parseArgs(argv) {
  const parsed = {}

  for (const arg of argv) {
    if (arg.startsWith("--scope=")) {
      parsed.scope = arg.slice("--scope=".length)
      continue
    }

    if (arg.startsWith("--llm=")) {
      parsed.llmMode = arg.slice("--llm=".length)
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
    llm: {
      ...defaultConfig.llm,
      ...(parsed.llm ?? {}),
    },
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
      // пробуем следующий base-ref
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

function createProgram(files) {
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

  return ts.createProgram({
    rootNames: parsedConfig?.fileNames ?? files,
    options: compilerOptions,
  })
}

function findReadabilityViolations(files) {
  const violations = []
  const program = createProgram(files)
  const checker = program.getTypeChecker()
  const fileSet = new Set(files.map((filePath) => path.resolve(filePath)))

  for (const absolutePath of files) {
    const relativePath = path.relative(projectRoot, absolutePath)
    const text = fs.readFileSync(absolutePath, "utf8")
    const sourceFile = program.getSourceFile(absolutePath)
    const activeSourceFile = sourceFile && fileSet.has(path.resolve(sourceFile.fileName)) ? sourceFile : null
    const context = {
      absolutePath,
      relativePath,
      text,
      sourceFile: activeSourceFile,
      checker,
      config,
      isTestFile: isTestOrStoryFile(absolutePath),
    }

    for (const rule of qualityTextRules) {
      violations.push(...rule.check(context))
    }
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

    for (const ruleId of entry.rules ?? []) {
      if (!qualityTextRuleIds.includes(ruleId)) {
        errors.push(`${filePath}: неизвестное правило ${ruleId}`)
      }
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

function estimateTokenBudget(files) {
  let characters = 0

  for (const filePath of files) {
    characters += fs.readFileSync(filePath, "utf8").length
  }

  return Math.ceil(characters / 4)
}

function resolveLlmMode(files) {
  const llmConfig = config.llm ?? defaultConfig.llm
  const requestedMode = args.llmMode ?? process.env.QUALITY_TEXT_LLM_MODE ?? llmConfig.mode ?? "off"

  if (requestedMode === "off") {
    return { mode: "off" }
  }

  if (requestedMode !== "optional") {
    return { mode: `fallback:${llmConfig.fallback}`, reason: `unknown-mode:${requestedMode}` }
  }

  const maxFiles = Number(llmConfig.maxFiles)
  const maxTokens = Number(llmConfig.maxTokens)
  const estimatedTokens = estimateTokenBudget(files)

  if (files.length > maxFiles || estimatedTokens > maxTokens) {
    return {
      mode: `fallback:${llmConfig.fallback}`,
      reason: `budget-exceeded:files=${files.length}/${maxFiles},tokens=${estimatedTokens}/${maxTokens}`,
    }
  }

  return { mode: `fallback:${llmConfig.fallback}`, reason: "provider-not-configured", estimatedTokens }
}

const files = resolveScopeFiles()
const llmState = resolveLlmMode(files)
const waivers = readWaivers()
const violations = files.length > 0 ? findReadabilityViolations(files) : []
const activeViolations = violations.filter((violation) => !isWaived(violation, waivers))
const waivedCount = violations.length - activeViolations.length

printTextReport({
  scope,
  filesChecked: files.length,
  violations: violations.length,
  waivedViolations: waivedCount,
  llmMode: llmState.mode,
  activeViolations,
})

if (activeViolations.length === 0) {
  process.exit(0)
}

process.exit(1)
