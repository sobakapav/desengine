// @openSpec capability: resource-status
// @openSpec scenarios:
// @openSpec  - "Диагностика собирает ресурс через общий resolver"
// @openSpec  - "Новый ресурс должен быть описан в конфигурации"
// @openSpec  - "Диагностика выбирает текст по condition"
// @openSpec  - "Текст использует переменные шаблона"
// @openSpec  - "Описание содержит внутреннюю ссылку"
// @openSpec  - "Разработчик запускает unit-проверку статусов ресурсов"
// @openSpec  - "Разработчик запускает traceability-проверку"

import { describe, expect, it } from "vitest"

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

  it("явно падает при неизвестном condition ресурса", () => {
    expect(() =>
      resolveResourceStatus({
        id: "allowlist-network",
        condition: "unknown",
      }),
    ).toThrow('Не найден condition "unknown" для системного ресурса allowlist-network')
  })
})
