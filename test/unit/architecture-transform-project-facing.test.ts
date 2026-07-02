// @openSpec capability: architecture-transform
// @openSpec scenarios:
// @openSpec  - "Команда открывает архитектурную линию перед новой волной"
// @openSpec  - "Downstream change пытается расширить список сквозных сущностей"
// @openSpec  - "Команда описывает место AI-трансформации в архитектурной карте"
// @openSpec  - "Downstream change проектирует новый workflow или рабочий surface"
// @openSpec  - "Downstream change меняет архитектурную границу"
// @openSpec  - "Downstream change убирает архитектурную панель с project page"
// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает страницу конкретного проекта"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { buildProjectArchitectureTransformModel } from "../../components/desengine/project/projectArchitectureTransformSurface"
import { normalizeProject } from "../../lib/project/runtime"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("architecture transform project-facing surface", () => {
  it("строит project-facing model без размытия producer-рамки", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Альфа",
      settings: {
        uiKitId: "ant",
      },
    })

    const model = buildProjectArchitectureTransformModel({
      isActive: true,
      project,
      historyDiagnostics: {
        projectId: "project-a",
        events: [
          {
            id: "event-1",
            createdAt: "2026-06-15T10:00:00.000Z",
            componentTitle: "Hero card",
            kind: "project-focus-set",
            message: "Проект переведён в фокус на компонент «Hero card».",
          },
        ],
        summary: {
          eventCount: 2,
          focusChangeCount: 1,
          createdComponentCount: 1,
          completedComponentCount: 1,
          lastActivityAt: null,
        },
      },
      workflowReadout: {
        projectId: "project-a",
        sessionStatus: "in_progress",
        currentStageId: "component-delivery",
        currentStageTitle: "Довести компонент «Hero card»",
        lastActivityAt: "2026-06-15T10:00:00.000Z",
        lastActivityLabel: "2026-06-15 10:00 UTC",
        stages: [
          {
            id: "project-structure",
            title: "Собрать состав проекта",
            description: "Проект получает набор компонентов, с которыми реально можно работать дальше.",
            status: "completed",
          },
        ],
        entries: [
          {
            projectId: "project-a",
            componentId: "hero-card",
            componentTitle: "Hero card",
            componentStatus: "in_progress",
            isFocused: true,
            stageTitle: "Проект сейчас работает через этот компонент",
            stageStatus: "in_progress",
            lastActivityAt: "2026-06-15T10:00:00.000Z",
            notes: ["Компонент удерживает текущий фокус проектной работы."],
          },
        ],
      },
    })

    expect(model.headline).toBe("Architecture transform")
    expect(model.visionLabel).toContain("AI-трансформация")
    expect(model.attractors.map((item) => item.id)).toEqual(["code", "llm", "budget", "design"])
    expect(model.attractors[0]?.projectSignal).toContain("компонент")
    expect(model.attractors[1]?.projectSignal).toContain("LLM")
    expect(model.attractors[2]?.projectSignal).toContain("Workflow readout")
    expect(model.attractors[3]?.projectSignal).toContain("UI kit")
    expect(model.constraints).toEqual(expect.arrayContaining([
      expect.stringContaining("Сессия работы"),
      expect.stringContaining("Workbench не считается автоматически равным одному workflow-шагу"),
      expect.stringContaining("Новые сквозные сущности"),
      expect.stringContaining("явное место в коде"),
    ]))
    expect(model.nextWaves.map((item) => item.title)).toEqual([
      "Wave 2. Кодовое проявление сущностей",
      "Wave 3. Сквозные линии кода и LLM",
      "Wave 4. Cleanup и выравнивание",
    ])
  })

  it("оставляет architecture-transform line в контракте без обязательного project-panel mount", () => {
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const panel = readProjectFile("components", "desengine", "project", "ProjectArchitectureTransformPanel.tsx")
    const surface = readProjectFile("components", "desengine", "project", "projectArchitectureTransformSurface.ts")
    const architectureSpec = readProjectFile("openspec", "specs", "architecture-transform", "spec.md")
    const coveragePlan = readProjectFile("test", "traceability", "coverage-plan.json")

    expect(projectOverview).not.toContain("ProjectArchitectureTransformPanel")

    expect(panel).toContain("project-facing слой")
    expect(panel).toContain("Текущие ограничения рабочей модели")
    expect(panel).toContain("Ближайшие архитектурные волны")

    expect(surface).toContain('id: "code"')
    expect(surface).toContain('id: "llm"')
    expect(surface).toContain('id: "budget"')
    expect(surface).toContain('id: "design"')
    expect(surface).toContain("AI-трансформация здесь работает как vision-рамка")

    expect(architectureSpec).toContain("### Requirement: Архитектурная линия не навязывает project page отдельную пользовательскую панель")
    expect(architectureSpec).toContain("#### Scenario: Downstream change убирает архитектурную панель с project page")
    expect(coveragePlan).toContain('"architecture-transform"')
  })
})
