import { spawnSync } from "node:child_process"

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:dispatch -- <dispatcher-change> --kind <implement|fix> --name <short-name> --description \"...\"")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true }
  }

  const parsed = {
    dispatcher: "",
    kind: "",
    name: "",
    description: "",
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (!parsed.dispatcher && !arg.startsWith("-")) {
      parsed.dispatcher = arg
      continue
    }
    if (arg === "--kind") {
      parsed.kind = (argv[index + 1] || "").trim()
      index += 1
      continue
    }
    if (arg === "--name") {
      parsed.name = (argv[index + 1] || "").trim()
      index += 1
      continue
    }
    if (arg === "--description") {
      parsed.description = argv[index + 1] || ""
      index += 1
      continue
    }
    if (arg.startsWith("--kind=")) {
      parsed.kind = arg.slice("--kind=".length).trim()
      continue
    }
    if (arg.startsWith("--name=")) {
      parsed.name = arg.slice("--name=".length).trim()
      continue
    }
    if (arg.startsWith("--description=")) {
      parsed.description = arg.slice("--description=".length)
      continue
    }
  }

  if (!parsed.dispatcher || !parsed.kind || !parsed.name) {
    throw new Error("Нужны параметры: dispatcher, kind и name.")
  }
  if (!["implement", "fix"].includes(parsed.kind)) {
    throw new Error("--kind должен быть implement или fix.")
  }

  return { ...parsed, help: false }
}

function normalizeChangeName(kind, name) {
  if (name.startsWith("implement-") || name.startsWith("fix-")) {
    return name
  }
  return `${kind}-${name}`
}

function run() {
  const parsed = parseArgs(process.argv.slice(2))

  if (parsed.help) {
    printUsage()
    return
  }

  const changeName = normalizeChangeName(parsed.kind, parsed.name)
  const args = ["run", "os:begin", "--", parsed.dispatcher, "--spawn-implement", changeName]

  if (parsed.description) {
    args.push("--description", parsed.description)
  }

  const result = spawnSync("npm", args, { stdio: "inherit" })
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }

  console.log("")
  console.log(`Диспетчеризация завершена: ${parsed.dispatcher} -> ${changeName}`)
  console.log(`Исполнение вести только в ${changeName}`)
}

run()
