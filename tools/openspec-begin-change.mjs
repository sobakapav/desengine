import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const CHANGES_DIR = path.resolve(process.cwd(), "openspec/changes")
const ALLOWED_IMPLEMENT_KINDS = new Set(["implement", "fix"])

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:begin -- <change-name>")
  console.error("  npm run os:begin -- <dispatcher-change> --spawn-implement <implement-change>")
  console.error("  npm run os:begin -- <dispatcher-change> --spawn-implement <implement-change> --description \"...\"")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true }
  }

  let changeName = null
  let spawnImplement = ""
  let description = ""

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (!changeName && !arg.startsWith("-")) {
      changeName = arg
      continue
    }

    if (arg === "--spawn-implement") {
      spawnImplement = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg.startsWith("--spawn-implement=")) {
      spawnImplement = arg.slice("--spawn-implement=".length).trim()
      continue
    }

    if (arg === "--description") {
      description = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg.startsWith("--description=")) {
      description = arg.slice("--description=".length)
      continue
    }
  }

  if (!changeName) {
    throw new Error("Не указано имя change.")
  }

  return { help: false, changeName, spawnImplement, description }
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
    metadataPath,
    kind: readValue("change_kind"),
    executionMode: readValue("execution_mode"),
    parentChange: readValue("parent_change"),
    strategyRoot: readValue("strategy_root"),
    roadmapRef: readValue("roadmap_ref"),
    releaseRef: readValue("release_ref"),
    verificationLevel: readValue("verification_level"),
    verificationCommand: readValue("verification_command"),
  }
}

function updateMetadata(changeName, updates) {
  const metadataPath = path.join(CHANGES_DIR, changeName, ".openspec.yaml")
  let text = fs.readFileSync(metadataPath, "utf8")

  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}: "${String(value).replaceAll('"', '\\"')}"`
    const pattern = new RegExp(`^${key}:\\s*.*$`, "m")

    if (pattern.test(text)) {
      text = text.replace(pattern, line)
    } else {
      text = `${text.endsWith("\n") ? text : `${text}\n`}${line}\n`
    }
  }

  fs.writeFileSync(metadataPath, text, "utf8")
}

function createImplementChange(dispatcherName, implementName, description) {
  if (!implementName.startsWith("implement-") && !implementName.startsWith("fix-")) {
    throw new Error("Имя исполнительского change должно начинаться с implement- или fix-.")
  }

  const args = [path.join("tools", "create-openspec-change.mjs"), implementName]
  if (description) {
    args.push("--description", description)
  }

  const result = spawnSync("node", args, { cwd: process.cwd(), stdio: "inherit" })

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }
}

function main() {
  const parsed = parseArgs(process.argv.slice(2))

  if (parsed.help) {
    printUsage()
    return
  }

  const current = readMetadata(parsed.changeName)

  if (current.kind === "dispatcher") {
    if (!parsed.spawnImplement) {
      console.error(`Change ${parsed.changeName} имеет тип dispatcher.`)
      console.error("Прямая реализация кода в dispatcher запрещена.")
      console.error("")
      console.error("Следующий шаг:")
      console.error(`- Создать implement/fix change и связать его с ${parsed.changeName}`)
      console.error(`- Пример: npm run os:begin -- ${parsed.changeName} --spawn-implement implement-<имя> --description \"...\"`)
      process.exit(2)
    }

    createImplementChange(parsed.changeName, parsed.spawnImplement, parsed.description)
    const created = readMetadata(parsed.spawnImplement)

    updateMetadata(parsed.spawnImplement, {
      parent_change: parsed.changeName,
      strategy_root: current.strategyRoot || parsed.changeName,
      release_ref: current.releaseRef || created.releaseRef,
    })

    console.log("")
    console.log(`Создан исполнительский change: ${parsed.spawnImplement}`)
    console.log(`- parent_change: ${parsed.changeName}`)
    console.log(`- strategy_root: ${current.strategyRoot || parsed.changeName}`)
    if (current.releaseRef) {
      console.log(`- release_ref: ${current.releaseRef}`)
    }
    console.log(`Запусти: npm run os:begin -- ${parsed.spawnImplement}`)
    return
  }

  if (!ALLOWED_IMPLEMENT_KINDS.has(current.kind)) {
    console.log(`Change ${parsed.changeName}: kind=${current.kind}, execution_mode=${current.executionMode}`)
    console.log("Это не исполнительский change. Реализацию кода запускать не нужно.")
    return
  }

  console.log(`Готово к реализации: ${parsed.changeName}`)
  console.log(`- kind: ${current.kind}`)
  console.log(`- parent_change: ${current.parentChange || "(не задан)"}`)
  console.log(`- strategy_root: ${current.strategyRoot || "(не задан)"}`)
  console.log(`- verification_level: ${current.verificationLevel || "(не задан)"}`)
  console.log(`- verification_command: ${current.verificationCommand || "(не задан)"}`)
}

main()
