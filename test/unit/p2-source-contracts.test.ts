// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Root-документ упоминает административную команду"
// @openSpec  - "Читатель открывает `tools/README.md` или admin-раздел root-документации"
// @openSpec  - "Разработчик запускает unit-проект Vitest"
// @openSpec  - "Разработчик добавляет новый модуль в `lib`"
// @openSpec capability: navigation
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает product-shell страницу"
// @openSpec  - "Пользователь смотрит на правую часть Navigation"
// @openSpec  - "Пользователь ориентируется в основных разделах продукта"
// @openSpec capability: ui-foundation
// @openSpec scenarios:
// @openSpec  - "Команда добавляет или меняет product-shell страницу"
// @openSpec  - "Команда работает с динамическим render-островком"
// @openSpec  - "Команда оценивает простой статический shell-компонент"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

function projectPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments)
}

function readDocs(...fileNames: string[]) {
  return fileNames.map((fileName) => ({
    fileName,
    source: readProjectFile(fileName),
  }))
}

describe("P2 source contracts", () => {
  it("root-документы ссылаются на канонические admin-команды из tools/README.md", () => {
    const toolsReadme = readProjectFile("tools", "README.md")
    const rootDocs = readDocs("README.md", "INSTALL.md", "UPDATE.md")
    const commands = [
      "npm run smoke",
      "npm run allowlist:marker -- user@example.com",
    ]

    for (const command of commands) {
      expect(toolsReadme).toContain(command)
    }

    for (const { fileName, source } of rootDocs) {
      expect(source, fileName).not.toMatch(/\bnode\s+tools\//)

      for (const command of commands) {
        if (source.includes(command)) {
          expect(toolsReadme, `${fileName}: ${command}`).toContain(command)
        }
      }
    }
  })

  it("tools/README.md и root-документация явно отделяют admin-контур от browser-only пользователя", () => {
    const toolsReadme = readProjectFile("tools", "README.md")
    const readme = readProjectFile("README.md")
    const install = readProjectFile("INSTALL.md")

    expect(toolsReadme).toContain("## Аудитория")
    expect(toolsReadme).toContain("Администратор локальной установки")
    expect(toolsReadme).toContain("Browser-only пользователь")
    expect(readme).toContain("## Пользовательский контур")
    expect(readme).toContain("## Административный контур")
    expect(install).toContain("## Аудитория и роль")
  })

  it("unit-проект Vitest ищет тесты только в test/unit, а не в lib", () => {
    const vitestConfig = readProjectFile("vitest.config.ts")
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts: Record<string, string>
    }
    const libTests = fs
      .readdirSync(projectPath("lib"), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(?:test|spec)\.tsx?$/.test(entry.name))

    expect(packageJson.scripts["test:unit"]).toBe("vitest run --project unit")
    expect(packageJson.scripts["test:integration"]).toBe("vitest run --project integration")
    expect(vitestConfig).toContain("name: 'integration'")
    expect(vitestConfig).toContain("include: ['test/integration/**/*.test.ts']")
    expect(vitestConfig).toContain("name: 'unit'")
    expect(vitestConfig).toContain("include: ['test/unit/**/*.test.ts']")
    expect(libTests).toHaveLength(0)
  })

  it("Playwright e2e config различает managed webServer и explicit external server modes", () => {
    const playwrightConfig = readProjectFile("playwright.e2e.config.ts")
    const browserVerificationHelper = readProjectFile("test", "helpers", "browser-verification.ts")

    expect(playwrightConfig).toContain("resolveBrowserVerificationRuntime")
    expect(playwrightConfig).toContain('webServer: runtime.mode === "externalServer"')
    expect(browserVerificationHelper).toContain("DESENGINE_E2E_EXTERNAL_SERVER")
    expect(browserVerificationHelper).toContain("DESENGINE_E2E_BASE_URL")
    expect(browserVerificationHelper).toContain("требуется явный DESENGINE_E2E_BASE_URL")
  })

  it("lib не содержит новых runtime-модулей плоским списком верхнего уровня", () => {
    const topLevelFiles = fs
      .readdirSync(projectPath("lib"), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)

    expect(topLevelFiles).toEqual([])
    expect(fs.existsSync(projectPath("lib", "llm.server.ts"))).toBe(false)
    expect(fs.existsSync(projectPath("lib", "user-state.server.ts"))).toBe(false)
    expect(fs.existsSync(projectPath("lib", "prompts.server.ts"))).toBe(false)
  })

  it("шаблон локальной конфигурации первым шагом объясняет переименование", () => {
    const template = readProjectFile("desengine.config-example.txt")
    const lines = template.split(/\r?\n/)

    expect(lines[0]).toContain("Переименуйте этот файл в desengine.config.txt")
  })

  it("официальный smoke-flow проверяет конфиг, доступ и production build", () => {
    const install = readProjectFile("INSTALL.md")
    const smoke = readProjectFile("tools", "smoke-local-install.mjs")

    expect(install).toContain("npm run smoke")
    expect(smoke).toContain("createLlmChecks")
    expect(smoke).toContain("createAllowlistCheck")
    expect(smoke).toContain("runBuildCheck")
  })

  it("install-tools используют канонический модуль локального конфига без legacy-import пути", () => {
    const toolFiles = [
      readProjectFile("tools", "smoke-local-install.mjs"),
      readProjectFile("tools", "generate-allowlist-marker.mjs"),
    ]

    for (const source of toolFiles) {
      expect(source).toContain("../lib/system/config/local.cjs")
      expect(source).not.toContain("../lib/local-config.cjs")
    }
  })

  it("локальная документация согласована по config, routes и allowlist-flow", () => {
    const docs = readDocs("README.md", "INSTALL.md", "UPDATE.md")

    for (const { fileName, source } of docs) {
      expect(source, fileName).toContain("desengine.config.txt")
      expect(source, fileName).toContain("/system")
    }

    expect(readProjectFile("README.md")).toContain("/auth")
    expect(readProjectFile("INSTALL.md")).toContain("allowlist")
  })

  it("инструкции первого запуска разделяют роли пользователя и администратора", () => {
    const readme = readProjectFile("README.md")
    const install = readProjectFile("INSTALL.md")

    expect(readme).toContain("Пользовательский контур")
    expect(readme).toContain("Административный контур")
    expect(install).toContain("Администратор")
    expect(install).toContain("Пользователь")
  })

  it("root-документы ведут к профильным документам вместо полного дублирования частных тем", () => {
    const readme = readProjectFile("README.md")
    const install = readProjectFile("INSTALL.md")

    for (const docPath of [
      "docs/access-control.md",
      "docs/openai.md",
      "docs/deepseek.md",
      "docs/gemini.md",
      "docs/platform-notes.md",
      "tools/README.md",
    ]) {
      expect(readme).toContain(docPath)
    }

    expect(install).toContain("docs/access-control.md")
    expect(install).toContain("docs/platform-notes.md")
  })

  it("docs/deepseek.md не обещает text-only fallback для image-bearing flow", () => {
    const deepseekDocs = readProjectFile("docs", "deepseek.md")
    const deepseekRuntime = readProjectFile("lib", "llm", "providers", "deepseek.ts")

    expect(deepseekRuntime).toContain("не поддерживает запросы с изображениями")
    expect(deepseekDocs).toContain("Text-only запросы допустимы только для сценариев без изображений.")
    expect(deepseekDocs).toContain("завершаются ранней ошибкой")
    expect(deepseekDocs).toContain("выбрать провайдера с vision-поддержкой")
    expect(deepseekDocs).toContain("не запускать сценарий, которому нужны изображения")
    expect(deepseekDocs).not.toContain("если у уровня есть картинки, они не передаются в DeepSeek API")
    expect(deepseekDocs).not.toContain("Текстовый контекст задачи и ограничения по JSON-ответу при этом сохраняются")
  })

  it("product-shell страницы получают общий Navigation из root layout", () => {
    const layout = readProjectFile("app", "layout.tsx")

    expect(layout).toContain('import { Navigation } from "@/components/desengine/system/Navigation"')
    expect(layout).toContain("<Navigation />")
    expect(fs.existsSync(projectPath("app", "page.tsx"))).toBe(true)
    expect(fs.existsSync(projectPath("app", "projects", "page.tsx"))).toBe(true)
    expect(fs.existsSync(projectPath("app", "auth", "page.tsx"))).toBe(true)
    expect(fs.existsSync(projectPath("app", "system", "page.tsx"))).toBe(true)
    expect(fs.existsSync(projectPath("app", "help", "page.tsx"))).toBe(true)
  })

  it("Navigation содержит постоянные контакты справа", () => {
    const navigation = readProjectFile("components", "desengine", "system", "Navigation.tsx")

    expect(navigation).toContain("contactLinks")
    expect(navigation).toContain("https://t.me/eduhund_bot")
    expect(navigation).toContain("mailto:edu@eduhund.com")
    expect(navigation).toContain('target={item.external ? "_blank" : undefined}')
  })

  it("top-level URL map представлена path-based маршрутами и фабриками путей", () => {
    const navigationHelpers = readProjectFile("lib", "system", "navigation.ts")
    const navigation = readProjectFile("components", "desengine", "system", "Navigation.tsx")

    expect(readProjectFile("lib", "auth", "navigation.ts")).toContain("/auth")
    expect(navigationHelpers).toContain("/system")
    expect(readProjectFile("lib", "project", "navigation.ts")).toContain("/projects")
    expect(readProjectFile("lib", "help", "navigation.ts")).toContain("/help")

    expect(navigation).toContain('href: "/"')
    expect(navigation).toContain("getProjectsRootUrl()")
    expect(navigation).toContain("getSystemUrl()")
    expect(navigation).toContain("getHelpRootUrl()")
  })

  it("простой статический Navigation не требует механического boundary", () => {
    const navigation = readProjectFile("components", "desengine", "system", "Navigation.tsx")

    expect(navigation).not.toContain("ErrorBoundary")
    expect(navigation).not.toContain("PreviewRenderBoundary")
    expect(navigation).not.toContain("fallback")
  })
})
