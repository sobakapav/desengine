import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const ARCHIVE_DIR = path.join(CHANGES_DIR, "archive")

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:close -- <implement-or-fix-change>")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true, changeName: "" }
  }

  const changeName = argv.find((arg) => !arg.startsWith("-")) || ""
  if (!changeName) {
    throw new Error("Не указано имя change.")
  }

  return { help: false, changeName }
}

function readMetadata(changeName) {
  const metadataPath = path.join(CHANGES_DIR, changeName, ".openspec.yaml")
  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Change не найден: ${changeName}`)
  }

  const text = fs.readFileSync(metadataPath, "utf8")
  const readValue = (key) => {
    const match = text.match(new RegExp(`^${key}:\\s*(.+)\\s*$`, "m"))
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : ""
  }

  return {
    kind: readValue("change_kind"),
    verificationCommand: readValue("verification_command"),
  }
}

function runCommand(title, cmd, args) {
  console.log(`\n${title}`)
  const result = spawnSync(cmd, args, { stdio: "inherit" })
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }
}

function archiveChange(changeName) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true })
  const date = new Date().toISOString().slice(0, 10)
  let target = path.join(ARCHIVE_DIR, `${date}-${changeName}`)
  let suffix = 2

  while (fs.existsSync(target)) {
    target = path.join(ARCHIVE_DIR, `${date}-${changeName}-${suffix}`)
    suffix += 1
  }

  fs.renameSync(path.join(CHANGES_DIR, changeName), target)
  return target
}

function run() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    printUsage()
    return
  }

  const metadata = readMetadata(parsed.changeName)
  if (!["implement", "fix"].includes(metadata.kind)) {
    throw new Error(`Закрытие через os:close поддерживается только для implement/fix. Получено: ${metadata.kind}`)
  }
  if (!metadata.verificationCommand) {
    throw new Error("Не задан verification_command, закрытие невозможно.")
  }

  runCommand("Проверка change verification_command", "zsh", ["-lc", metadata.verificationCommand])
  runCommand("Проверка traceability", "npm", ["run", "test:traceability"])

  const archivedPath = archiveChange(parsed.changeName)
  console.log(`\nChange закрыт и архивирован: ${archivedPath}`)
}

run()
