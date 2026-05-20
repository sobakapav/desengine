import fs from "node:fs"
import path from "node:path"
import {
  CHANGE_KIND_PATTERN,
  PARENT_CHANGE_PATTERN,
  SHORT_PATTERN,
  parseMetadataValue,
  readText,
  relative,
} from "./common.mjs"
import { validateChangeKindRules } from "./change-rules.mjs"

export function readChangeDirs(changesDir) {
  if (!fs.existsSync(changesDir)) {
    return []
  }

  return fs
    .readdirSync(changesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => path.join(changesDir, entry.name))
}

function validateShortRules(value) {
  if (!value) {
    return []
  }

  const violations = []

  if (!/^\p{Ll}/u.test(value)) {
    violations.push("должно начинаться с маленькой буквы")
  }
  if (value.length > 75) {
    violations.push("должно быть не длиннее 75 символов")
  }
  if (/\p{P}$/u.test(value)) {
    violations.push("не должно заканчиваться знаком препинания")
  }

  return violations
}

export function collectChangeContext(changesRoot) {
  const changeDirs = readChangeDirs(changesRoot)
  const allChangeNames = new Set(changeDirs.map((dirPath) => path.basename(dirPath)))
  const changeKindsByName = new Map()
  const childCountByParent = new Map()

  for (const changeDir of changeDirs) {
    const metadataPath = path.join(changeDir, ".openspec.yaml")
    if (!fs.existsSync(metadataPath)) {
      continue
    }

    const metadata = readText(metadataPath)
    const changeName = path.basename(changeDir)
    const changeKind = parseMetadataValue(metadata, CHANGE_KIND_PATTERN)
    const parentChange = parseMetadataValue(metadata, PARENT_CHANGE_PATTERN) || ""

    if (changeKind) {
      changeKindsByName.set(changeName, changeKind)
    }
    if (parentChange) {
      childCountByParent.set(parentChange, (childCountByParent.get(parentChange) || 0) + 1)
    }
  }

  return { allChangeNames, changeDirs, changeKindsByName, childCountByParent }
}

export function validateChanges(projectRoot, changesRoot) {
  const errors = []
  const context = collectChangeContext(changesRoot)

  for (const changeDir of context.changeDirs) {
    const metadataPath = path.join(changeDir, ".openspec.yaml")
    if (!fs.existsSync(metadataPath)) {
      continue
    }

    const metadata = readText(metadataPath)
    const short = parseMetadataValue(metadata, SHORT_PATTERN)
    const changeName = path.basename(changeDir)

    for (const violation of validateShortRules(short)) {
      errors.push(`${relative(projectRoot, metadataPath)}: short ${violation}`)
    }
    for (const violation of validateChangeKindRules(changeName, metadata, context)) {
      errors.push(`${relative(projectRoot, metadataPath)}: ${violation}`)
    }
  }

  return errors
}
