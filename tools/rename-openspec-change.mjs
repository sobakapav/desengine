import fs from "node:fs"
import path from "node:path"

import { assertValidChangeName } from "./openspec-change-name.mjs"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const ARCHIVE_DIR = path.join(CHANGES_DIR, "archive")
const SELF_FILE_EXTENSIONS = new Set([".md", ".yaml", ".yml", ".json", ".txt"])
const REFERENCE_FIELDS = ["parent_change", "strategy_root", "roadmap_ref", "release_ref", "producer_ref", "depends_on_change"]

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
  const activePath = path.join(CHANGES_DIR, changeName)
  if (fs.existsSync(activePath)) {
    return activePath
  }

  const archivedPath = path.join(ARCHIVE_DIR, changeName)
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
  const activeDirs = fs.existsSync(CHANGES_DIR)
    ? fs.readdirSync(CHANGES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "archive")
      .map((entry) => path.join(CHANGES_DIR, entry.name))
    : []
  const archivedDirs = fs.existsSync(ARCHIVE_DIR)
    ? fs.readdirSync(ARCHIVE_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(ARCHIVE_DIR, entry.name))
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

function main() {
  let parsedArgs

  try {
    parsedArgs = parseArgs(process.argv.slice(2))
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

main()
