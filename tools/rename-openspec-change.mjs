import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import { assertValidChangeName } from "./openspec-change-name.mjs"

const SELF_FILE_EXTENSIONS = new Set([".md", ".yaml", ".yml", ".json", ".txt"])
const REFERENCE_FIELDS = ["parent_change", "strategy_root", "roadmap_ref", "release_ref", "producer_ref", "depends_on_change"]

function resolveChangesDir() {
  return path.resolve(process.cwd(), "openspec/changes")
}

function resolveArchiveDir() {
  return path.join(resolveChangesDir(), "archive")
}

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:rename -- <old-name> <new-name>")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true }
  }
  const positional = argv.filter((arg) => !arg.startsWith("-"))

  if (positional.length !== 2) {
    throw new Error("Нужны два параметра: старое имя change и новое имя change.")
  }

  return {
    help: false,
    oldName: positional[0].trim(),
    newName: assertValidChangeName(positional[1]),
  }
}

function resolveChangeDir(changeName) {
  const changesDir = resolveChangesDir()
  const archiveDir = resolveArchiveDir()
  const activePath = path.join(changesDir, changeName)
  if (fs.existsSync(activePath)) {
    return activePath
  }

  const archivedPath = path.join(archiveDir, changeName)
  if (fs.existsSync(archivedPath)) {
    return archivedPath
  }

  throw new Error(`Change не найден: ${changeName}`)
}

function rewriteSelfFiles(changeDir, oldName, newName) {
  for (const entry of fs.readdirSync(changeDir, { withFileTypes: true })) {
    const filePath = path.join(changeDir, entry.name)

    if (entry.isDirectory()) {
      rewriteSelfFiles(filePath, oldName, newName)
      continue
    }

    if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (!SELF_FILE_EXTENSIONS.has(ext)) {
        continue
      }

      const source = fs.readFileSync(filePath, "utf8")
      const next = source.replaceAll(oldName, newName)

      if (next !== source) {
        fs.writeFileSync(filePath, next, "utf8")
      }
    }
  }
}

function listAllChangeDirs() {
  const changesDir = resolveChangesDir()
  const archiveDir = resolveArchiveDir()
  const activeDirs = fs.existsSync(changesDir)
    ? fs.readdirSync(changesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "archive")
      .map((entry) => path.join(changesDir, entry.name))
    : []
  const archivedDirs = fs.existsSync(archiveDir)
    ? fs.readdirSync(archiveDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(archiveDir, entry.name))
    : []

  return [...activeDirs, ...archivedDirs]
}

function rewriteMetadataReferences(oldName, newName) {
  for (const changeDir of listAllChangeDirs()) {
    const metadataPath = path.join(changeDir, ".openspec.yaml")
    if (!fs.existsSync(metadataPath)) {
      continue
    }

    const source = fs.readFileSync(metadataPath, "utf8")
    let next = source

    for (const field of REFERENCE_FIELDS) {
      const pattern = new RegExp(`^(${field}:\\s*["']?)${oldName}(["']?\\s*)$`, "m")
      next = next.replace(pattern, `$1${newName}$2`)
    }

    next = next.replace(
      new RegExp(`^(roadmap_ref:\\s*["']?)${oldName}(/roadmaps/[^"'\n]+["']?\\s*)$`, "gm"),
      `$1${newName}$2`,
    )
    next = next.replace(
      new RegExp(`^([ \\t]*-[ \\t]*["']?)${oldName}(/roadmaps/[^"'\n]+["']?\\s*)$`, "gm"),
      `$1${newName}$2`,
    )

    if (next !== source) {
      fs.writeFileSync(metadataPath, next, "utf8")
    }
  }
}

/**
 * @example
 * runOpenSpecRename(["old-change", "new-change"])
 */
export function runOpenSpecRename(argv = process.argv.slice(2)) {
  let parsedArgs

  try {
    parsedArgs = parseArgs(argv)
    if (parsedArgs.help) {
      printUsage()
      return
    }

    if (parsedArgs.oldName === parsedArgs.newName) {
      throw new Error("Старое и новое имя change совпадают.")
    }

    const sourceDir = resolveChangeDir(parsedArgs.oldName)
    const targetDir = path.join(path.dirname(sourceDir), parsedArgs.newName)

    if (fs.existsSync(targetDir)) {
      throw new Error(`Change уже существует: ${parsedArgs.newName}`)
    }

    fs.renameSync(sourceDir, targetDir)
    rewriteSelfFiles(targetDir, parsedArgs.oldName, parsedArgs.newName)
    rewriteMetadataReferences(parsedArgs.oldName, parsedArgs.newName)

    console.log(`Переименован change: ${parsedArgs.oldName} -> ${parsedArgs.newName}`)
  } catch (error) {
    console.error(error.message)
    console.error("")
    printUsage()
    process.exit(1)
  }
}

const entrypointArg = process.argv[1]
const isCliEntrypoint = entrypointArg ? import.meta.url === pathToFileURL(entrypointArg).href : false

if (isCliEntrypoint) {
  runOpenSpecRename()
}
