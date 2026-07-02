import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  buildBaseUrl,
  buildServerEnv,
  canReuseExistingTargetServer,
  resolveFixtureAccessSalt,
  resolvePort,
  runCommand,
  validatePort,
  waitForProcessExit,
  waitForReadiness,
} from "./browser-verification-runtime-lib.mjs"

const DEFAULT_CHANNEL = "chromium"
const DEFAULT_SPEC = "test/e2e/browser-verification-runtime.spec.ts"
const SCRIPT_PATH = fileURLToPath(import.meta.url)

function readSpecs(argv = process.argv.slice(2)) {
  const specPaths = argv.filter((value) => value.endsWith(".spec.ts"))
  return specPaths.length > 0 ? specPaths : [DEFAULT_SPEC]
}

function buildPlaywrightCommandArgs(specPaths) {
  return ["run", "test:e2e", "--", ...specPaths]
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
