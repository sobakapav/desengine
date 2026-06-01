import { spawn, spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import net from "node:net"
import path from "node:path"

const DEFAULT_CHANNEL = "chromium"
const DEFAULT_SPEC = "test/e2e/browser-verification-runtime.spec.ts"
const READINESS_TIMEOUT_MS = 180_000
const READINESS_INTERVAL_MS = 1_000
const DEFAULT_FIXTURE_ACCESS_SALT = "desengine-e2e-salt"

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

function readSpec() {
  const arg = process.argv.slice(2).find((value) => value.endsWith(".spec.ts"))
  return arg || DEFAULT_SPEC
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

function canReuseExistingTargetServer() {
  const explicitBaseUrl = process.env.DESENGINE_E2E_BASE_URL?.trim()
  if (explicitBaseUrl) {
    return {
      reusable: true,
      baseUrl: normalizeBaseUrl(explicitBaseUrl),
      source: "explicit-base-url",
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
  const specPath = readSpec()
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
  const nextBinary = path.join(process.cwd(), "node_modules", ".bin", "next")
  const server = existingTarget.reusable
    ? null
    : spawn(
      nextBinary,
      ["dev", "--hostname", "127.0.0.1", "--port", String(port)],
      {
        detached: process.platform !== "win32",
        stdio: "inherit",
        env: buildServerEnv(),
      },
    )

  let shuttingDown = false
  const shutdown = () => {
    if (!server) return
    if (shuttingDown) return
    shuttingDown = true

    if (process.platform === "win32") {
      server.kill("SIGTERM")
      return
    }

    try {
      process.kill(-server.pid, "SIGTERM")
    } catch {
      server.kill("SIGTERM")
    }
  }

  process.on("SIGINT", () => {
    shutdown()
    process.exit(130)
  })
  process.on("SIGTERM", () => {
    shutdown()
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
      "Проверка browser verification runtime spec",
      "npm",
      ["run", "test:e2e", "--", specPath],
      externalEnv,
    )
  } finally {
    shutdown()
  }
}

await main()
