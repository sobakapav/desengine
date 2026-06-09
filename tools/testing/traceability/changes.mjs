import fs from "node:fs"
import path from "node:path"
import {
  CHANGE_KIND_PATTERN,
  PARENT_CHANGE_PATTERN,
  PRODUCER_REF_PATTERN,
  SHORT_PATTERN,
  parseMetadataValue,
  readText,
  relative,
} from "./common.mjs"
import { validateChangeKindRules } from "./change-rules.mjs"

/**
 * @example
 * readChangeDirs("openspec/changes")
 */
export function readChangeDirs(changesDir) {
  if (!fs.existsSync(changesDir)) {
    return []
  }

  return fs
    .readdirSync(changesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => path.join(changesDir, entry.name))
}

function readArchivedChangeDirs(changesDir) {
  const archiveDir = path.join(changesDir, "archive")

  if (!fs.existsSync(archiveDir)) {
    return []
  }

  return fs
    .readdirSync(archiveDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(archiveDir, entry.name))
}

function archivedOriginalName(archiveDirPath) {
  const archiveName = path.basename(archiveDirPath)
  const match = archiveName.match(/^\d{4}-\d{2}-\d{2}-(.+?)(?:-\d+)?$/)
  return match ? match[1] : archiveName
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

/**
 * @example
 * collectChangeContext("openspec/changes")
 */
export function collectChangeContext(changesRoot) {
  const changeDirs = readChangeDirs(changesRoot)
  const archivedChangeDirs = readArchivedChangeDirs(changesRoot)
  const allChangeNames = new Set(changeDirs.map((dirPath) => path.basename(dirPath)))
  const changeKindsByName = new Map()
  const changeDirByName = new Map()
  const childCountByParent = new Map()
  const parentByChangeName = new Map()
  const producerRefByChangeName = new Map()
  const archivedChangeKindsByName = new Map()
  const activeReleaseMembersByReleaseRef = new Map()

  for (const changeDir of changeDirs) {
    const metadataPath = path.join(changeDir, ".openspec.yaml")
    if (!fs.existsSync(metadataPath)) {
      continue
    }

    const metadata = readText(metadataPath)
    const changeName = path.basename(changeDir)
    const changeKind = parseMetadataValue(metadata, CHANGE_KIND_PATTERN)
    const parentChange = parseMetadataValue(metadata, PARENT_CHANGE_PATTERN) || ""
    const producerRef = parseMetadataValue(metadata, PRODUCER_REF_PATTERN) || ""
    const releaseRef = parseMetadataValue(metadata, /^release_ref:\s*(.+)\s*$/m) || ""

    if (changeKind) {
      changeKindsByName.set(changeName, changeKind)
    }
    changeDirByName.set(changeName, changeDir)
    if (parentChange) {
      parentByChangeName.set(changeName, parentChange)
      childCountByParent.set(parentChange, (childCountByParent.get(parentChange) || 0) + 1)
    }
    producerRefByChangeName.set(changeName, producerRef)
    if (releaseRef) {
      const members = activeReleaseMembersByReleaseRef.get(releaseRef) || []
      members.push(changeName)
      activeReleaseMembersByReleaseRef.set(releaseRef, members)
    }
  }

  for (const archivedChangeDir of archivedChangeDirs) {
    const metadataPath = path.join(archivedChangeDir, ".openspec.yaml")
    if (!fs.existsSync(metadataPath)) {
      continue
    }

    const metadata = readText(metadataPath)
    const archivedName = archivedOriginalName(archivedChangeDir)
    const changeKind = parseMetadataValue(metadata, CHANGE_KIND_PATTERN)

    if (changeKind && !archivedChangeKindsByName.has(archivedName)) {
      archivedChangeKindsByName.set(archivedName, changeKind)
    }
  }

  return {
    activeReleaseMembersByReleaseRef,
    allChangeNames,
    archivedChangeKindsByName,
    changeDirs,
    changeKindsByName,
    changeDirByName,
    childCountByParent,
    parentByChangeName,
    producerRefByChangeName,
    fileExists: (filePath) => fs.existsSync(filePath),
    hasRoadmapFiles: (changeName) => {
      const changeDir = changeDirByName.get(changeName)

      if (!changeDir) {
        return false
      }

      const roadmapDir = path.join(changeDir, "roadmaps")

      if (!fs.existsSync(roadmapDir)) {
        return false
      }

      return fs.readdirSync(roadmapDir, { withFileTypes: true }).some((entry) => entry.isFile() && entry.name.endsWith(".md"))
    },
  }
}

/**
 * @example
 * validateChanges(process.cwd(), "openspec/changes")
 */
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
