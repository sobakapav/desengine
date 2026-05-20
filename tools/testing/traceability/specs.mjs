import fs from "node:fs"
import path from "node:path"
import {
  CAPABILITY_PATTERN,
  SCENARIO_ITEM_PATTERN,
  SCENARIO_PATTERN,
  TEST_FILE_PATTERN,
  readText,
  walkFiles,
} from "./common.mjs"

export function readSpecs(specsRoot) {
  const specs = new Map()

  for (const entry of fs.readdirSync(specsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    const specPath = path.join(specsRoot, entry.name, "spec.md")
    if (!fs.existsSync(specPath)) {
      continue
    }

    const content = readText(specPath)
    const scenarios = [...content.matchAll(SCENARIO_PATTERN)].map((match) => match[1].trim())
    specs.set(entry.name, { path: specPath, scenarios: new Set(scenarios) })
  }

  return specs
}

export function readCoveragePlan(coveragePlanPath) {
  if (!fs.existsSync(coveragePlanPath)) {
    return {}
  }

  const parsed = JSON.parse(readText(coveragePlanPath))
  return parsed.uncoveredCapabilities || {}
}

export function parseTestMetadata(filePath) {
  const records = []
  let current = null

  for (const line of readText(filePath).split(/\r?\n/)) {
    const capabilityMatch = line.match(CAPABILITY_PATTERN)

    if (capabilityMatch) {
      current = { capability: capabilityMatch[1], scenarios: [], filePath }
      records.push(current)
      continue
    }

    const scenarioMatch = line.match(SCENARIO_ITEM_PATTERN)
    if (scenarioMatch && current) {
      current.scenarios.push(scenarioMatch[1])
    }
  }

  return records
}

export function readTestRecords(testsRoot) {
  const testFiles = walkFiles(testsRoot, (filePath) => TEST_FILE_PATTERN.test(filePath))
  return testFiles.flatMap(parseTestMetadata)
}
