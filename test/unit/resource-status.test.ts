// @openSpec capability: resource-status
// @openSpec scenarios:
// @openSpec  - "Диагностика собирает ресурс через общий resolver"
// @openSpec  - "Новый ресурс должен быть описан в конфигурации"
// @openSpec  - "Диагностика выбирает текст по condition"
// @openSpec  - "Текст использует переменные шаблона"
// @openSpec  - "Описание содержит внутреннюю ссылку"
// @openSpec  - "Карточка ресурса показывает встроенный контрол исправления"
// @openSpec  - "Старая версия системы показывается предупреждением"
// @openSpec  - "Нерелизное Git-состояние не блокирует систему"
// @openSpec  - "Разработчик запускает unit-проверку статусов ресурсов"
// @openSpec  - "Разработчик запускает traceability-проверку"

import { describe, expect, it } from "vitest"

import {
  getAccessSessionRemediationControl,
  getOnboardingContentRemediationControl,
  getSystemReleaseRemediationControl,
} from "@/lib/system/resources/remediation"
import {
  compareReleaseTags,
  getSystemReleaseCondition,
  selectLatestReleaseTag,
} from "@/lib/system/release"
import {
  getInvalidResourceDefinitions,
  getMissingResourceDefinitionIds,
  renderResourceTemplate,
  resolveResourceStatus,
} from "@/lib/system/resources/publicstate"

describe("resource status resolver", () => {
  it("покрывает конфигурацией все системные ресурсы", () => {
    expect(getMissingResourceDefinitionIds()).toEqual([])
    expect(getInvalidResourceDefinitions()).toEqual([])
  })

  it("собирает ресурс и инструкцию по condition", () => {
    const resolved = resolveResourceStatus({
      id: "llm-config",
      condition: "incomplete",
      values: {
        activeProvider: "openai",
        availabilityMessage: "Для режима OpenAI не настроен OPENAI_API_KEY",
        missingEnvVarsText: " Не хватает: OPENAI_API_KEY.",
        providerLabel: "OpenAI",
      },
    })

    expect(resolved.resource.id).toBe("llm-config")
    expect(resolved.resource.label).toBe("OpenAI API")
    expect(resolved.resource.state).toBe("blocked")
    expect(resolved.resource.summary).toContain("OpenAI")
    expect(resolved.resource.detail).toBe("Для режима OpenAI не настроен OPENAI_API_KEY")
    expect(resolved.instruction?.id).toBe("llm-config")
    expect(resolved.instruction?.actor).toBe("admin")
    expect(resolved.instruction?.text).toContain("openai")
    expect(resolved.instruction?.text).toContain("OPENAI_API_KEY")
  })

  it("подставляет переменные шаблона", () => {
    expect(
      renderResourceTemplate("Сервис {{ name }} отвечает кодом {{status}}.", {
        name: "Allowlist",
        status: 200,
      }),
    ).toBe("Сервис Allowlist отвечает кодом 200.")
  })

  it("сохраняет Markdown-ссылки из конфигурации", () => {
    const resolved = resolveResourceStatus({
      id: "access-session",
      condition: "expired",
    })

    expect(resolved.resource.detail).toContain("](/auth)")
    expect(resolved.instruction?.text).toContain("](/auth)")
  })

  it("назначает встроенные контролы только для исправимых статусов", () => {
    expect(
      getAccessSessionRemediationControl({
        authState: "expired",
        accessConfigured: true,
      }),
    ).toEqual({ kind: "auth-form" })

    expect(
      getAccessSessionRemediationControl({
        authState: "missing",
        accessConfigured: false,
      }),
    ).toBeUndefined()

    expect(
      getOnboardingContentRemediationControl({
        detail: "Нужна повторная синхронизация.",
        repoConfigured: true,
        syncState: "unconfirmed",
      }),
    ).toEqual({
      kind: "onboarding-update",
      canUpdate: true,
      detail: "Нужна повторная синхронизация.",
      syncState: "unconfirmed",
    })

    expect(
      getOnboardingContentRemediationControl({
        detail: "Репозиторий не настроен.",
        repoConfigured: false,
        syncState: "missing",
      }),
    ).toBeUndefined()

    expect(
      getSystemReleaseRemediationControl({
        branch: "main",
        canUpdate: true,
        condition: "updateAvailable",
        currentVersion: "v0.1.5",
        dirty: false,
        latestVersion: "v0.1.6",
        message: "проверка релизов выполнена",
        nearestVersion: "v0.1.5",
        remoteUrl: "https://example.com/desengine.git",
        updateSafety: "Кнопка обновит систему до последнего релизного тега.",
      }),
    ).toEqual({
      kind: "system-update",
      canUpdate: true,
      currentVersion: "v0.1.5",
      detail: "Кнопка обновит систему до последнего релизного тега.",
      latestVersion: "v0.1.6",
    })

    expect(
      getSystemReleaseRemediationControl({
        branch: "main",
        canUpdate: false,
        condition: "development",
        currentVersion: null,
        dirty: true,
        latestVersion: "v0.1.6",
        message: "проверка релизов выполнена",
        nearestVersion: "v0.1.6",
        remoteUrl: "https://example.com/desengine.git",
        updateSafety: "Автоматическое обновление сейчас не требуется.",
      }),
    ).toBeUndefined()
  })

  it("определяет последний git-релиз по semver-тегам", () => {
    expect(selectLatestReleaseTag(["v0.1.9", "v0.1.10", "refs/tags/v0.2.0"])).toBe("v0.2.0")
    expect(compareReleaseTags("v0.1.10", "v0.1.9")).toBeGreaterThan(0)
  })

  it("считает старую версию системы предупреждением, а dev-состояние отдельным condition", () => {
    expect(
      getSystemReleaseCondition({
        currentVersion: "v0.1.5",
        latestVersion: "v0.1.6",
        nearestVersion: "v0.1.5",
      }),
    ).toBe("updateAvailable")

    expect(
      getSystemReleaseCondition({
        currentVersion: null,
        latestVersion: "v0.1.6",
        nearestVersion: "v0.1.6",
      }),
    ).toBe("development")
  })

  it("явно падает при неизвестном condition ресурса", () => {
    expect(() =>
      resolveResourceStatus({
        id: "allowlist-network",
        condition: "unknown",
      }),
    ).toThrow('Не найден condition "unknown" для системного ресурса allowlist-network')
  })
})
