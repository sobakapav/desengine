// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Workflow definition описывает тип проектной операции"
// @openSpec  - "Workflow run принадлежит проекту и конкретному предмету работы"
// @openSpec capability: workflow-catalog
// @openSpec scenarios:
// @openSpec  - "Пользователь или система видит каталог workflow"
// @openSpec  - "Workflow catalog группирует definitions по operation family"
// @openSpec  - "Добавляется новый workflow family"

import { describe, expect, it } from "vitest"

import {
  getWorkflowDefinition,
  listWorkflowCatalogSeed,
  listWorkflowDefinitionsForSubjectKind,
} from "../../lib/project/workflow-catalog"

describe("workflow catalog seed set", () => {
  it("публикует первый набор definitions для разных семейств проектной работы", () => {
    const definitions = listWorkflowCatalogSeed()

    expect(definitions.map((definition) => definition.id)).toEqual([
      "component-from-image-or-figma",
      "component-composition",
      "screen-composition",
      "ui-kit-migration",
      "mock-data-and-loading-states",
    ])

    expect(new Set(definitions.map((definition) => definition.operationFamily))).toEqual(new Set([
      "component-creation",
      "component-composition",
      "screen-composition",
      "ui-kit-migration",
      "data-generation",
    ]))
  })

  it("даёт найти definition по id и увидеть его subject scope", () => {
    const definition = getWorkflowDefinition("screen-composition")

    expect(definition).toMatchObject({
      id: "screen-composition",
      operationFamily: "screen-composition",
      subjectKinds: ["screen", "screen-set"],
    })
    expect(definition?.entrySurfaces).toContain("screen-map")
    expect(definition?.producedArtifacts).toContain("screen-layout")
  })

  it("фильтрует definitions по subject kind", () => {
    expect(listWorkflowDefinitionsForSubjectKind("component").map((definition) => definition.id)).toEqual([
      "component-from-image-or-figma",
      "component-composition",
      "mock-data-and-loading-states",
    ])

    expect(listWorkflowDefinitionsForSubjectKind("design-system-migration").map((definition) => definition.id)).toEqual([
      "ui-kit-migration",
    ])
  })

  it("показывает, что data/domain слой уже входит в workflow catalog", () => {
    const definition = getWorkflowDefinition("mock-data-and-loading-states")

    expect(definition?.subjectKinds).toContain("data-set")
    expect(definition?.inputRequirements).toEqual([
      {
        mode: "all-of",
        inputs: ["domain-schema", "mock-data-constraints"],
        summary: "Нужна предметная схема и ограничения для mock-данных.",
      },
      {
        mode: "optional",
        inputs: ["loading-state-profile"],
        summary: "Профиль задержек и прогрузки может быть добавлен поверх базовой data-волны.",
      },
    ])
    expect(definition?.producedArtifacts).toContain("mock-data-set")
    expect(definition?.stepDefinitions.map((step) => step.id)).toEqual([
      "define-data-boundaries",
      "generate-mocks",
      "simulate-loading",
    ])
  })

  it("умеет выражать альтернативные и опциональные inputs в definition", () => {
    const componentDefinition = getWorkflowDefinition("component-from-image-or-figma")
    const migrationDefinition = getWorkflowDefinition("ui-kit-migration")

    expect(componentDefinition?.inputRequirements).toEqual([
      {
        mode: "one-of",
        inputs: ["image", "figma-json"],
        summary: "Нужен хотя бы один визуальный источник: изображение или Figma JSON.",
      },
    ])

    expect(migrationDefinition?.inputRequirements).toEqual([
      {
        mode: "all-of",
        inputs: ["ui-kit-target"],
        summary: "Нужен целевой UI kit или дизайн-система.",
      },
      {
        mode: "optional",
        inputs: ["component-selection"],
        summary: "Можно ограничить migration выбранным набором компонентов, а можно мигрировать весь проект.",
      },
    ])
  })
})
