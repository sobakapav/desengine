import { spawnSync } from "node:child_process"

function printUsage() {
  console.error("Использование:")
  console.error("  npm run os:req -- <producer-or-dispatcher-change> --request \"<текст хотелки>\" [--kind implement|fix]")
  console.error("  npm run os:req -- <release-change> --dispatcher <producer-or-dispatcher-change> --request \"<текст хотелки>\" [--kind implement|fix]")
}

function parseArgs(argv) {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    return { help: true }
  }

  let sourceChange = ""
  let request = ""
  let kind = "fix"
  let targetDispatcher = ""

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!sourceChange && !arg.startsWith("-")) {
      sourceChange = arg
      continue
    }
    if (arg === "--request") {
      request = argv[index + 1] || ""
      index += 1
      continue
    }
    if (arg.startsWith("--request=")) {
      request = arg.slice("--request=".length)
      continue
    }
    if (arg === "--kind") {
      kind = (argv[index + 1] || "").trim() || "fix"
      index += 1
      continue
    }
    if (arg === "--dispatcher") {
      targetDispatcher = (argv[index + 1] || "").trim()
      index += 1
      continue
    }
    if (arg.startsWith("--kind=")) {
      kind = arg.slice("--kind=".length).trim() || "fix"
    }
    if (arg.startsWith("--dispatcher=")) {
      targetDispatcher = arg.slice("--dispatcher=".length).trim()
    }
  }

  if (!sourceChange || !request) {
    throw new Error("Нужны параметры dispatcher и request.")
  }
  if (!["implement", "fix"].includes(kind)) {
    throw new Error("--kind должен быть implement или fix.")
  }

  return { help: false, sourceChange, request, kind, targetDispatcher }
}

function slugify(text) {
  const latin = text
    .toLowerCase()
    .replace(/[а-яё]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const words = latin.split("-").filter(Boolean).slice(0, 8)
  return words.join("-") || "task"
}

function run() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    printUsage()
    return
  }

  const name = slugify(parsed.request)
  const args = [
    "run",
    "os:dispatch",
    "--",
    parsed.sourceChange,
    "--kind",
    parsed.kind,
    "--name",
    name,
    "--description",
    parsed.request,
  ]

  if (parsed.targetDispatcher) {
    args.push("--dispatcher", parsed.targetDispatcher)
  }

  const result = spawnSync("npm", args, { stdio: "inherit" })
  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }
}

run()
