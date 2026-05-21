import fs from "node:fs"
import path from "node:path"

export const TEST_FILE_PATTERN = /\.(?:test|spec)\.(?:js|jsx|mjs|ts|tsx)$/
export const SCENARIO_PATTERN = /^#### Scenario:\s*(.+?)\s*$/gm
export const CAPABILITY_PATTERN = /^\s*\/\/\s*@openSpec\s+capability:\s*([a-z0-9-]+)\s*$/i
export const SCENARIO_ITEM_PATTERN = /^\s*\/\/\s*@openSpec\s+-\s*"(.+)"\s*$/i
export const SHORT_PATTERN = /^short:\s*(.+)\s*$/m
export const CHANGE_KIND_PATTERN = /^change_kind:\s*(.+)\s*$/m
export const EXECUTION_MODE_PATTERN = /^execution_mode:\s*(.+)\s*$/m
export const PARENT_CHANGE_PATTERN = /^parent_change:\s*(.+)\s*$/m
export const STRATEGY_ROOT_PATTERN = /^strategy_root:\s*(.+)\s*$/m
export const ROADMAP_REF_PATTERN = /^roadmap_ref:\s*(.+)\s*$/m
export const ROADMAP_REFS_PATTERN = /^roadmap_refs:\s*\n((?:\s*-\s*.+\n?)*)/m
export const RELEASE_REF_PATTERN = /^release_ref:\s*(.+)\s*$/m
export const PRODUCER_REF_PATTERN = /^producer_ref:\s*(.+)\s*$/m
export const VERIFICATION_LEVEL_PATTERN = /^verification_level:\s*(.+)\s*$/m
export const VERIFICATION_COMMAND_PATTERN = /^verification_command:\s*(.+)\s*$/m

export const CHANGE_KINDS = new Set(["focus", "release", "idea", "producer", "dispatcher", "implement", "fix"])
export const EXECUTION_MODES = new Set(["no-code", "code"])
export const GOVERNED_PREFIXES = ["focus", "release", "idea", "producer", "dispatcher", "implement", "fix"]

export function readText(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

export function walkFiles(dirPath, predicate, result = []) {
  if (!fs.existsSync(dirPath)) {
    return result
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      walkFiles(entryPath, predicate, result)
      continue
    }

    if (entry.isFile() && predicate(entryPath)) {
      result.push(entryPath)
    }
  }

  return result
}

export function relative(projectRoot, filePath) {
  return path.relative(projectRoot, filePath)
}

export function parseMetadataValue(metadataText, pattern) {
  const match = metadataText.match(pattern)

  if (!match) {
    return null
  }

  return match[1].trim().replace(/^["']|["']$/g, "")
}

export function parseMetadataList(metadataText, pattern) {
  const match = metadataText.match(pattern)

  if (!match) {
    return []
  }

  return match[1]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean)
}
