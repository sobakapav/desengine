import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"
import net from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const DEFAULT_CHANNEL = "chromium"
const DEFAULT_SPEC = "test/e2e/browser-verification-runtime.spec.ts"
const READINESS_TIMEOUT_MS = 180_000
const READINESS_INTERVAL_MS = 1_000
const DEFAULT_FIXTURE_ACCESS_SALT = "desengine-e2e-salt"
const NEXT_DEV_LOCK_PATH = path.join(process.cwd(), ".next", "dev", "lock")
const SCRIPT_PATH = fileURLToPath(import.meta.url)

const require = createRequire(import.meta.url)
const localConfig = require("../../lib/system/config/local.cjs")

function validatePort(value) {
  const normalized = Number(value)

  if (!Number.isInteger(normalized) || normalized < 1) {
    throw new Error("DESENGINE_E2E_PORT должен быть положительным целым числом.")
  }

  return normalized
}

async function resolvePort() {
  if (process.env.DESENGINE_E2E_PORT) {
    return validatePort(process.env.DESENGINE_E2E_PORT)
  }

  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()

      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Не удалось определить свободный localhost-порт.")))
        return
      }

      const { port } = address
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve(port)
      })
    })
  })
}

function readSpecs(argv = process.argv.slice(2)) {
  const specPaths = argv.filter((value) => value.endsWith(".spec.ts"))
  return specPaths.length > 0 ? specPaths : [DEFAULT_SPEC]
}

function buildPlaywrightCommandArgs(specPaths) {
  return ["run", "test:e2e", "--", ...specPaths]
}

function resolveFixtureAccessSalt() {
  const explicitSalt = process.env.DESENGINE_E2E_ACCESS_SALT?.trim()
  if (explicitSalt) {
    return explicitSalt
  }

  const configuredSalt = process.env.ALLOWLIST_SALT?.trim()
    || process.env.DESENGINE_ALLOWLIST_SALT?.trim()
  if (configuredSalt) {
    return configuredSalt
  }

  localConfig.loadLocalConfig()

  return process.env.ALLOWLIST_SALT?.trim()
    || process.env.DESENGINE_ALLOWLIST_SALT?.trim()
    || DEFAULT_FIXTURE_ACCESS_SALT
}

function buildBaseUrl(port) {
  return `http://127.0.0.1:${port}`
}

function normalizeBaseUrl(value) {
  const normalized = (value || "").trim()

  if (!normalized) {
    throw new Error("DESENGINE_E2E_BASE_URL должен быть непустым абсолютным URL.")
  }

  let parsedUrl

  try {
    parsedUrl = new URL(normalized)
  } catch {
    throw new Error("DESENGINE_E2E_BASE_URL должен быть абсолютным URL.")
  }

  if (parsedUrl.hostname === "localhost") {
    parsedUrl.hostname = "127.0.0.1"
  }

  return parsedUrl.toString().replace(/\/+$/, "")
}

function buildServerEnv() {
  const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
  const fixtureAccessSalt = resolveFixtureAccessSalt()

  return {
    ...process.env,
    ALLOWLIST_BASE_URL: fixtureAccessEnabled ? "http://127.0.0.1:9/" : "",
    ALLOWLIST_SALT: fixtureAccessEnabled ? fixtureAccessSalt : "",
    DESENGINE_ALLOWLIST_BASE_URL: "",
    DESENGINE_ALLOWLIST_SALT: "",
    DESENGINE_E2E_EXTERNAL_SERVER: "",
    DESENGINE_E2E_BASE_URL: "",
    LLM_PROVIDER: "deepseek",
    OPENAI_API_KEY: "",
    OPENAI_MODEL: "",
    OPENAI_BASE_URL: "",
    DEEPSEEK_API_KEY: "",
    DEEPSEEK_MODEL: "deepseek-test",
    DEEPSEEK_BASE_URL: "https://api.deepseek.example",
    GEMINI_API_KEY: "",
    GEMINI_MODEL: "",
    GEMINI_BASE_URL: "",
    ONBOARDING_REPO_URL: "",
    DESENGINE_ONBOARDING_REPO_URL: "",
  }
}

function runCommand(title, command, args, env) {
  console.log(`\n${title}`)
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env,
  })

  if (result.error) {
    throw result.error
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status)
  }
}

function probeReadiness(url) {
  return spawnSync(
    "curl",
    ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "5", url],
    { encoding: "utf8" },
  )
}

function readNextDevLock() {
  try {
    const raw = fs.readFileSync(NEXT_DEV_LOCK_PATH, "utf8")
    const parsed = JSON.parse(raw)
    const pid = Number(parsed?.pid)
    const baseUrl = normalizeBaseUrl(parsed?.appUrl || `http://${parsed?.hostname}:${parsed?.port}`)

    if (!Number.isInteger(pid) || pid < 1) {
      return null
    }

    return {
      pid,
      baseUrl,
    }
  } catch {
    return null
  }
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function removeNextDevLock() {
  try {
    fs.rmSync(NEXT_DEV_LOCK_PATH, { force: true })
  } catch {}
}

function waitForProcessExit(serverProcess, timeoutMs = 10_000) {
  if (!serverProcess) {
    return Promise.resolve()
  }

  if (serverProcess.exitCode !== null) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      serverProcess.off("exit", finish)
      serverProcess.off("error", finish)
      resolve()
    }

    const timer = setTimeout(() => {
      if (serverProcess.exitCode === null) {
        serverProcess.kill("SIGKILL")
      }
      finish()
    }, timeoutMs)

    serverProcess.once("exit", finish)
    serverProcess.once("error", finish)
  })
}

function canReuseExistingTargetServer() {
  const explicitBaseUrl = process.env.DESENGINE_E2E_BASE_URL?.trim()
  if (explicitBaseUrl) {
    return {
      reusable: true,
      baseUrl: normalizeBaseUrl(explicitBaseUrl),
      source: "explicit-base-url",
    }
  }

  const lockedTarget = readNextDevLock()
  if (lockedTarget) {
    const readinessUrl = new URL("/api/status/llm", `${lockedTarget.baseUrl}/`).toString()
    const result = probeReadiness(readinessUrl)
    const status = Number((result.stdout || "").trim())

    if (!result.error && result.status === 0 && status >= 200 && status < 500) {
      return {
        reusable: true,
        baseUrl: lockedTarget.baseUrl,
        source: "next-dev-lock",
      }
    }

    if (!isProcessAlive(lockedTarget.pid)) {
      removeNextDevLock()
    }
  }

  const defaultBaseUrl = buildBaseUrl(validatePort(process.env.DESENGINE_E2E_PORT || "3410"))
  const readinessUrl = new URL("/api/status/llm", `${defaultBaseUrl}/`).toString()
  const result = probeReadiness(readinessUrl)
  const status = Number((result.stdout || "").trim())

  if (!result.error && result.status === 0 && status >= 200 && status < 500) {
    return {
      reusable: true,
      baseUrl: defaultBaseUrl,
      source: "default-localhost-port",
    }
  }

  return {
    reusable: false,
    baseUrl: "",
    source: "",
  }
}

async function waitForReadiness(url, serverProcess) {
  const deadline = Date.now() + READINESS_TIMEOUT_MS

  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `Локальный target server завершился до readiness route ${url}. Exit code: ${serverProcess.exitCode}.`,
      )
    }

    const result = probeReadiness(url)
    const status = Number((result.stdout || "").trim())

    if (!result.error && result.status === 0 && status >= 200 && status < 500) {
      console.log(`Browser verification server ready: ${url} -> HTTP ${status}`)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, READINESS_INTERVAL_MS))
  }

  throw new Error(
    `Не удалось дождаться readiness route ${url} за ${READINESS_TIMEOUT_MS}ms.`,
  )
}

async function main() {
  const specPaths = readSpecs()
  const fixtureAccessSalt = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
    ? resolveFixtureAccessSalt()
    : ""
  const existingTarget = canReuseExistingTargetServer()
  const port = existingTarget.reusable ? null : await resolvePort()
  const baseUrl = existingTarget.reusable ? existingTarget.baseUrl : buildBaseUrl(port)
  const readinessUrl = new URL("/api/status/llm", `${baseUrl}/`).toString()
  const externalEnv = {
    ...process.env,
    DESENGINE_E2E_RUNNER: "browser-wrapper",
    DESENGINE_E2E_EXTERNAL_SERVER: "1",
    DESENGINE_E2E_BASE_URL: baseUrl,
    DESENGINE_E2E_ACCESS_SALT: fixtureAccessSalt || process.env.DESENGINE_E2E_ACCESS_SALT || "",
    PLAYWRIGHT_BROWSER_CHANNEL: process.env.PLAYWRIGHT_BROWSER_CHANNEL || DEFAULT_CHANNEL,
  }
  const nextCliEntrypoint = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next")
  const server = existingTarget.reusable
    ? null
    : spawn(
      process.execPath,
      [nextCliEntrypoint, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
      {
        stdio: "inherit",
        env: buildServerEnv(),
      },
    )

  let shuttingDown = false
  let shutdownPromise = null
  const shutdown = async () => {
    if (!server) return
    if (shutdownPromise) {
      await shutdownPromise
      return
    }
    shuttingDown = true
    shutdownPromise = (async () => {
      if (server.exitCode === null) {
        server.kill("SIGTERM")
      }
      await waitForProcessExit(server)
    })()
    await shutdownPromise
  }

  process.on("SIGINT", async () => {
    await shutdown()
    process.exit(130)
  })
  process.on("SIGTERM", async () => {
    await shutdown()
    process.exit(143)
  })

  try {
    if (existingTarget.reusable) {
      console.log(
        `Browser verification wrapper переиспользует существующий target server (${existingTarget.source}): ${baseUrl}`,
      )
    } else {
      console.log(`Browser verification wrapper использует локальный port ${port}`)
      await waitForReadiness(readinessUrl, server)
    }

    runCommand(
      "Проверка browser target preflight",
      "node",
      ["tools/testing/browser-target-preflight.mjs"],
      externalEnv,
    )
    runCommand(
      "Проверка browser verification runtime specs",
      "npm",
      buildPlaywrightCommandArgs(specPaths),
      externalEnv,
    )
  } finally {
    await shutdown()
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  await main()
}

export {
  buildPlaywrightCommandArgs,
  readSpecs,
}
