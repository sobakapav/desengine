import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { appendReleaseNoteToRelease } from "./openspec-release-notes.mjs"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const ARCHIVE_DIR = path.join(CHANGES_DIR, "archive")
const MANAGED_BROWSER_PREFLIGHT_COMMAND =
  "node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts"
const EXTERNAL_BROWSER_PREFLIGHT_COMMAND =
  "node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts"

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
    releaseRef: readValue("release_ref"),
    verificationLevel: readValue("verification_level"),
    verificationCommand: readValue("verification_command"),
  }
}

function requiresBrowserPreflight(metadata) {
  return metadata.kind === "fix"
    && metadata.verificationLevel === "component/browser"
    && !metadata.verificationCommand.includes("browser-verification-runtime.spec.ts")
}

function getBrowserPreflightCommand(metadata) {
  return metadata.verificationCommand.includes("DESENGINE_E2E_EXTERNAL_SERVER=1")
    ? EXTERNAL_BROWSER_PREFLIGHT_COMMAND
    : MANAGED_BROWSER_PREFLIGHT_COMMAND
}

function extractPlaywrightSpecPath(command) {
  const match = command.match(/test\/e2e\/[^\s"'`]+\.spec\.ts/)
  return match ? match[0] : ""
}

function getWrappedBrowserVerificationCommand(metadata) {
  if (metadata.verificationLevel !== "component/browser") {
    return metadata.verificationCommand
  }

  if (metadata.verificationCommand.includes("run-browser-verification-runtime.mjs")) {
    return metadata.verificationCommand
  }

  if (!metadata.verificationCommand.includes("npm run test:e2e")) {
    return metadata.verificationCommand
  }

  const specPath = extractPlaywrightSpecPath(metadata.verificationCommand)
  if (!specPath) {
    return metadata.verificationCommand
  }

  const prefix = metadata.verificationCommand.split("npm run test:e2e")[0] || ""
  return `${prefix}node tools/testing/run-browser-verification-runtime.mjs ${specPath}`.trim()
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

function syncReleaseNotes(changeName, metadata) {
  if (!metadata.releaseRef) {
    return
  }

  const result = appendReleaseNoteToRelease({
    changeName,
    changesDir: CHANGES_DIR,
    releaseRef: metadata.releaseRef,
  })

  if (result.status === "appended") {
    console.log(`\nRelease notes обновлены: ${result.releaseNotesPath}`)
  }
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

  if (requiresBrowserPreflight(metadata)) {
    runCommand(
      "Проверка browser verification preflight",
      "zsh",
      ["-lc", getBrowserPreflightCommand(metadata)],
    )
  }

  runCommand("Проверка change verification_command", "zsh", ["-lc", getWrappedBrowserVerificationCommand(metadata)])
  runCommand("Проверка traceability", "npm", ["run", "test:traceability"])
  syncReleaseNotes(parsed.changeName, metadata)

  const archivedPath = archiveChange(parsed.changeName)
  console.log(`\nChange закрыт и архивирован: ${archivedPath}`)
}

run()
