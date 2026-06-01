type BrowserVerificationMode = "webServer" | "externalServer"
type BrowserVerificationStage = "target-server" | "browser-launch" | "browser-route"

type BrowserVerificationRuntime = {
  authPath: string
  authURL: string
  baseURL: string
  browserChannel: string
  e2ePort: number
  fixtureAccessEnabled: boolean
  fixtureAccessSalt: string
  mode: BrowserVerificationMode
  readinessPath: string
  readinessURL: string
}

type BrowserVerificationEnv = NodeJS.ProcessEnv

type ErrorWithCause = Error & {
  cause?: unknown
}

function readExternalServerBaseUrl(env: BrowserVerificationEnv) {
  const value = env.DESENGINE_E2E_BASE_URL ?? ""

  if (!value.trim()) {
    throw new Error(
      "Для DESENGINE_E2E_EXTERNAL_SERVER=1 требуется явный DESENGINE_E2E_BASE_URL.",
    )
  }

  return normalizeBaseUrl(value, "DESENGINE_E2E_BASE_URL")
}

function normalizeBaseUrl(value: string, variableName: string) {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${variableName} должен быть непустым абсолютным URL.`)
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(normalized)
  } catch {
    throw new Error(`${variableName} должен быть абсолютным URL.`)
  }

  return parsedUrl.toString().replace(/\/+$/, "")
}

function getBrowserChannel(env: BrowserVerificationEnv) {
  return env.PLAYWRIGHT_BROWSER_CHANNEL?.trim() || "chrome"
}

function readE2ePort(env: BrowserVerificationEnv) {
  const value = Number(env.DESENGINE_E2E_PORT || 3410)

  if (!Number.isInteger(value) || value < 1) {
    throw new Error("DESENGINE_E2E_PORT должен быть положительным целым числом.")
  }

  return value
}

function readManagedBaseUrl(env: BrowserVerificationEnv, e2ePort: number) {
  const value = env.DESENGINE_E2E_BASE_URL?.trim() ?? ""

  if (value) {
    throw new Error(
      "DESENGINE_E2E_BASE_URL допустим только вместе с DESENGINE_E2E_EXTERNAL_SERVER=1.",
    )
  }

  return `http://127.0.0.1:${e2ePort}`
}

function readErrorMessage(cause: unknown) {
  if (cause instanceof Error) {
    return cause.message
  }

  return String(cause)
}

function collectErrorMessages(cause: unknown, messages = new Set<string>()) {
  const message = readErrorMessage(cause).trim()

  if (message) {
    messages.add(message)
  }

  if (cause && typeof cause === "object" && "cause" in cause) {
    collectErrorMessages((cause as ErrorWithCause).cause, messages)
  }

  return [...messages]
}

function isLocalhostTransportBlocked(cause: unknown) {
  const combined = collectErrorMessages(cause).join(" | ")

  return /connect EPERM 127\.0\.0\.1:\d+/.test(combined)
    || /Local \(0\.0\.0\.0:0\)/.test(combined)
}

function resolveBrowserVerificationRuntime(
  env: BrowserVerificationEnv = process.env,
): BrowserVerificationRuntime {
  const e2ePort = readE2ePort(env)
  const externalServerMode = env.DESENGINE_E2E_EXTERNAL_SERVER === "1"
  const mode: BrowserVerificationMode = externalServerMode ? "externalServer" : "webServer"
  const baseURL = externalServerMode
    ? readExternalServerBaseUrl(env)
    : readManagedBaseUrl(env, e2ePort)

  return {
    authPath: "/auth",
    authURL: new URL("/auth", `${baseURL}/`).toString(),
    baseURL,
    browserChannel: getBrowserChannel(env),
    e2ePort,
    fixtureAccessEnabled: env.DESENGINE_E2E_FIXTURE_ACCESS === "1",
    fixtureAccessSalt: env.DESENGINE_E2E_ACCESS_SALT || "desengine-e2e-salt",
    mode,
    readinessPath: "/api/status/llm",
    readinessURL: new URL("/api/status/llm", `${baseURL}/`).toString(),
  }
}

function getBrowserVerificationModeLabel(runtime: BrowserVerificationRuntime) {
  return runtime.mode === "externalServer"
    ? "external-server verification"
    : "managed webServer verification"
}

function formatBrowserVerificationFailure(
  input: {
    runtime: BrowserVerificationRuntime
    stage: BrowserVerificationStage
    cause: unknown
  },
) {
  if (
    input.stage === "target-server"
    && input.runtime.mode === "externalServer"
    && isLocalhostTransportBlocked(input.cause)
  ) {
    return [
      "Browser verification preflight не смог проверить target server изнутри test process.",
      `Base URL: ${input.runtime.baseURL}.`,
      `В этой среде Node/Playwright worker не может открыть localhost-соединение к ${input.runtime.authURL}.`,
      "Это transport-ограничение runtime (`connect EPERM`), а не доказательство, что внешний target server недоступен.",
      "Отдельный shell probe вроде `curl` может отвечать 200, даже если preflight внутри `npm run test:e2e` не имеет такого доступа.",
      "Не интерпретируй этот verdict как product failure: проверь target server внешним shell probe или запускай browser verification вне sandboxed worker.",
      `Исходная ошибка: ${collectErrorMessages(input.cause).join(" | ")}`,
    ].join(" ")
  }

  const modeLabel = getBrowserVerificationModeLabel(input.runtime)
  const stageLabel = input.stage === "target-server"
    ? "target server"
    : input.stage === "browser-launch"
      ? "browser launch"
      : "browser route"
  const stageHint = input.stage === "target-server"
    ? `Preflight должен получить HTTP 200 от ${input.runtime.authURL}.`
    : input.stage === "browser-launch"
      ? `Chromium должен стартовать через PLAYWRIGHT_BROWSER_CHANNEL=${input.runtime.browserChannel}.`
      : `После старта Chromium должен открыть ${input.runtime.authURL}.`
  const modeHint = input.runtime.mode === "externalServer"
    ? `Проверь, что внешний target server уже поднят и DESENGINE_E2E_BASE_URL=${input.runtime.baseURL} указывает на него.`
    : `Проверь, что Playwright смог поднять managed webServer на 127.0.0.1:${input.runtime.e2ePort} и среда разрешает bind этого порта.`

  return [
    `Browser verification preflight не прошёл на этапе ${stageLabel} для ${modeLabel}.`,
    `Base URL: ${input.runtime.baseURL}.`,
    stageHint,
    modeHint,
    `Исходная ошибка: ${readErrorMessage(input.cause)}`,
  ].join(" ")
}

export {
  formatBrowserVerificationFailure,
  getBrowserVerificationModeLabel,
  isLocalhostTransportBlocked,
  resolveBrowserVerificationRuntime,
}
export type {
  BrowserVerificationMode,
  BrowserVerificationRuntime,
  BrowserVerificationStage,
}
