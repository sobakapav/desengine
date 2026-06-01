// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Credentials не заданы"
// @openSpec  - "Разработчик запускает полный локальный тестовый слой"
// @openSpec  - "Разработчик запускает browser verification preflight"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  assertBrowserVerificationRunner,
  formatBrowserVerificationFailure,
  getBrowserVerificationModeLabel,
  getWrapperRunnerCommand,
  isLocalhostTransportBlocked,
  resolveBrowserVerificationRuntime,
} from "../helpers/browser-verification"

describe("browser verification runtime contract", () => {
  it("требует явный base URL для external server режима", () => {
    expect(() => resolveBrowserVerificationRuntime({
      DESENGINE_E2E_EXTERNAL_SERVER: "1",
    })).toThrow("DESENGINE_E2E_BASE_URL")
  })

  it("использует локальный webServer path по умолчанию", () => {
    expect(resolveBrowserVerificationRuntime({})).toMatchObject({
      authURL: "http://127.0.0.1:3410/auth",
      baseURL: "http://127.0.0.1:3410",
      browserChannel: "chromium",
      codexSandboxMode: "",
      e2ePort: 3410,
      mode: "webServer",
      readinessURL: "http://127.0.0.1:3410/api/status/llm",
      requiresWrapperRunner: false,
    })
  })

  it("не принимает DESENGINE_E2E_BASE_URL в managed webServer режиме", () => {
    expect(() => resolveBrowserVerificationRuntime({
      DESENGINE_E2E_BASE_URL: "http://127.0.0.1:3999",
    })).toThrow("DESENGINE_E2E_EXTERNAL_SERVER=1")
  })

  it("явно маркирует внешний verification mode", () => {
    const runtime = resolveBrowserVerificationRuntime({
      PLAYWRIGHT_BROWSER_CHANNEL: "chromium",
      DESENGINE_E2E_EXTERNAL_SERVER: "1",
      DESENGINE_E2E_BASE_URL: " http://127.0.0.1:3410/ ",
    })

    expect(runtime.authURL).toBe("http://127.0.0.1:3410/auth")
    expect(runtime.browserChannel).toBe("chromium")
    expect(runtime.mode).toBe("externalServer")
    expect(runtime.readinessURL).toBe("http://127.0.0.1:3410/api/status/llm")
    expect(getBrowserVerificationModeLabel(runtime)).toBe("external-server verification")
  })

  it("в Codex seatbelt требует wrapper runner вместо прямого npm run test:e2e", () => {
    const env = {
      CODEX_SANDBOX: "seatbelt",
    }

    expect(resolveBrowserVerificationRuntime(env)).toMatchObject({
      codexSandboxMode: "seatbelt",
      requiresWrapperRunner: true,
    })
    expect(() => assertBrowserVerificationRunner(env, "test/e2e/workbench-context-visibility.spec.ts")).toThrow(
      getWrapperRunnerCommand("test/e2e/workbench-context-visibility.spec.ts"),
    )
  })

  it("не требует wrapper runner вне Codex sandbox или внутри wrapper path", () => {
    expect(() => assertBrowserVerificationRunner({
      CODEX_SANDBOX: "",
    })).not.toThrow()

    expect(() => assertBrowserVerificationRunner({
      CODEX_SANDBOX: "seatbelt",
      DESENGINE_E2E_RUNNER: "browser-wrapper",
    })).not.toThrow()
  })

  it("классифицирует недоступность target server для managed webServer режима", () => {
    const runtime = resolveBrowserVerificationRuntime({
      DESENGINE_E2E_PORT: "3510",
    })

    expect(formatBrowserVerificationFailure({
      runtime,
      stage: "target-server",
      cause: new Error("listen EPERM 127.0.0.1:3510"),
    })).toContain("managed webServer verification")
    expect(formatBrowserVerificationFailure({
      runtime,
      stage: "target-server",
      cause: new Error("listen EPERM 127.0.0.1:3510"),
    })).toContain("127.0.0.1:3510")
  })

  it("классифицирует browser launch failure для external server режима", () => {
    const runtime = resolveBrowserVerificationRuntime({
      PLAYWRIGHT_BROWSER_CHANNEL: "chromium",
      DESENGINE_E2E_EXTERNAL_SERVER: "1",
      DESENGINE_E2E_BASE_URL: "http://127.0.0.1:3410",
    })

    const message = formatBrowserVerificationFailure({
      runtime,
      stage: "browser-launch",
      cause: new Error("browserType.launch: SIGABRT"),
    })

    expect(message).toContain("external-server verification")
    expect(message).toContain("PLAYWRIGHT_BROWSER_CHANNEL=chromium")
    expect(message).toContain("SIGABRT")
  })

  it("отделяет blocked localhost transport test process от реальной недоступности external target server", () => {
    const runtime = resolveBrowserVerificationRuntime({
      DESENGINE_E2E_EXTERNAL_SERVER: "1",
      DESENGINE_E2E_BASE_URL: "http://127.0.0.1:3410",
    })
    const cause = new TypeError("fetch failed", {
      cause: new Error("connect EPERM 127.0.0.1:3410 - Local (0.0.0.0:0)"),
    })

    expect(isLocalhostTransportBlocked(cause)).toBe(true)

    const message = formatBrowserVerificationFailure({
      runtime,
      stage: "target-server",
      cause,
    })

    expect(message).toContain("не смог проверить target server изнутри test process")
    expect(message).toContain("transport-ограничение runtime")
    expect(message).toContain("shell probe")
    expect(message).toContain("Не интерпретируй этот verdict как product failure")
  })

  it("документация и handoff запрещают принимать downstream browser-fix без валидного preflight", () => {
    const docs = fs.readFileSync(path.join(process.cwd(), "docs", "testing-layer.md"), "utf8")
    const readme = fs.readFileSync(path.join(process.cwd(), "test", "README.md"), "utf8")
    const tasks = fs.readFileSync(
      path.join(process.cwd(), "openspec", "changes", "fix-browser-verification-runtime", "tasks.md"),
      "utf8",
    )
    const handoff = fs.readFileSync(
      path.join(process.cwd(), "openspec", "changes", "fix-browser-verification-runtime", "handoff.md"),
      "utf8",
    )

    expect(docs).toContain("отделить infra failure от product verdict")
    expect(readme).toContain("Если preflight невалиден, downstream browser-fix нельзя считать принятым")

    for (const source of [tasks, handoff]) {
      expect(source).toContain("fix-sandpack-tailwind-preview-pipeline")
      expect(source).toContain("fix-iterate-timeout-feedback")
      expect(source).toContain("fix-workbench-context-visibility")
      expect(source).toMatch(/(невалидный preflight|валидного preflight)/)
      expect(source).toMatch(/(блокирует `os:close`|нельзя закрывать|нельзя считать принятым|закрываются только после)/)
    }
  })

  it("os:close запускает browser preflight до product verdict для component/browser fixes", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "tools", "openspec-close-change.mjs"),
      "utf8",
    )
    const toolsReadme = fs.readFileSync(
      path.join(process.cwd(), "tools", "README.md"),
      "utf8",
    )

    expect(source).toContain("MANAGED_BROWSER_PREFLIGHT_COMMAND")
    expect(source).toContain("EXTERNAL_BROWSER_PREFLIGHT_COMMAND")
    expect(source).toContain("getBrowserPreflightCommand")
    expect(source).toContain("getWrappedBrowserVerificationCommand")
    expect(source).toContain("extractPlaywrightSpecPath")
    expect(source).toContain('metadata.verificationLevel === "component/browser"')
    expect(source).toContain("node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts")
    expect(source).toContain("Проверка browser verification preflight")
    expect(toolsReadme).toContain("browser verification preflight")
  })

  it("Playwright managed webServer ждёт лёгкий readiness route, а preflight отдельно проверяет /auth", () => {
    const playwrightConfig = fs.readFileSync(
      path.join(process.cwd(), "playwright.e2e.config.ts"),
      "utf8",
    )
    const spec = fs.readFileSync(
      path.join(process.cwd(), "test", "e2e", "browser-verification-runtime.spec.ts"),
      "utf8",
    )

    expect(playwrightConfig).toContain("url: runtime.readinessURL")
    expect(spec).toContain("request.get(runtime.authURL")
    expect(spec).toContain('stage: "target-server"')
    expect(spec).toContain('name: "Введите email"')
    expect(spec).toContain('name: "Открыть защищённую лабораторию"')
  })

  it("change verification_command использует изолированный wrapper с тем же browser preflight spec", () => {
    const wrapper = fs.readFileSync(
      path.join(process.cwd(), "tools", "testing", "run-browser-verification-runtime.mjs"),
      "utf8",
    )

    expect(wrapper).toContain("test/e2e/browser-verification-runtime.spec.ts")
    expect(wrapper).toContain('DESENGINE_E2E_RUNNER: "browser-wrapper"')
    expect(wrapper).toContain('const DEFAULT_CHANNEL = "chromium"')
    expect(wrapper).toContain('"npm"')
    expect(wrapper).toContain('"run", "dev"')
    expect(wrapper).toContain('"/api/status/llm"')
    expect(wrapper).toContain("browser-target-preflight.mjs")
    expect(wrapper).toContain("createRequire(import.meta.url)")
    expect(wrapper).toContain("DESENGINE_E2E_ACCESS_SALT")
    expect(wrapper).toContain("localConfig.loadLocalConfig()")
  })
})
