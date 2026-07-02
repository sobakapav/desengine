// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает историю проекта"
// @openSpec  - "Пользователь видит последнюю project-level активность"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { buildProjectHistoryDiagnosticsModel } from "../../components/desengine/project/projectSurface"
import type { ProjectHistoryDiagnosticsSnapshot } from "../../lib/project/history-diagnostics"
import { buildProjectHistoryDiagnosticsSummary, clipTextPreview } from "../../lib/project/history-diagnostics"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project history diagnostics surface", () => {
  it("строит explainability-friendly model из project activity snapshot", () => {
    const snapshot: ProjectHistoryDiagnosticsSnapshot = {
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
      summary: buildProjectHistoryDiagnosticsSummary({
        activities: [
          {
            id: "event-1",
            projectId: "project-a",
            createdAt: "2026-06-15T10:00:00.000Z",
            componentId: "hero-card",
            componentTitle: "Hero card",
            kind: "project-focus-set",
            message: "Проект переведён в фокус на компонент «Hero card».",
          },
        ],
        components: [
          {
            id: "hero-card",
            projectId: "project-a",
            title: "Hero card",
            workflowKind: "image-to-component-workflow",
            status: "in_progress",
            createdAt: "2026-06-15T09:00:00.000Z",
            updatedAt: "2026-06-15T10:00:00.000Z",
          },
        ],
      }),
    }

    const model = buildProjectHistoryDiagnosticsModel(snapshot)

    expect(model.summary).toMatchObject({
      eventCountLabel: "1 событие",
      focusChangeCountLabel: "1 смена фокуса",
      createdComponentCountLabel: "0 созданных компонентов",
      completedComponentCountLabel: "0 готовых компонентов",
      lastActivityLabel: "2026-06-15 10:00 UTC",
    })
    expect(model.events[0]).toMatchObject({
      componentLabel: "Компонент: Hero card",
      kindLabel: "Сменился фокус проекта",
    })
  })

  it("обрезает длинное сообщение и подключает history surface к project page", () => {
    expect(clipTextPreview("  Один   два   три  ", 12)).toBe("Один два три")
    expect(clipTextPreview("Очень длинный prompt для истории проекта", 16)).toBe("Очень длинный p…")

    const projectPage = readProjectFile("app", "projects", "[projectId]", "page.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const projectSupportPanels = readProjectFile("components", "desengine", "project", "ProjectOverviewSupportPanels.tsx")
    const diagnosticsPanel = readProjectFile("components", "desengine", "project", "ProjectHistoryDiagnosticsPanel.tsx")
    const diagnosticsAdapter = readProjectFile("lib", "project", "history-diagnostics.ts")
    const projectSpec = readProjectFile("openspec", "specs", "projects", "spec.md")

    expect(projectPage).not.toContain("readProjectHistoryDiagnostics")
    expect(projectOverview).toContain("ProjectOverviewSupportPanels")
    expect(projectSupportPanels).toContain("ProjectHistoryDiagnosticsPanel")
    expect(projectSupportPanels).toContain("historyDiagnostics={historyDiagnostics}")

    expect(diagnosticsPanel).toContain("История проектной работы")
    expect(diagnosticsPanel).toContain("Смены фокуса")
    expect(diagnosticsPanel).toContain("История проектной работы пока пуста")

    expect(diagnosticsAdapter).toContain("buildProjectHistoryDiagnosticsSnapshot")
    expect(diagnosticsAdapter).toContain("createdComponentCount")
    expect(diagnosticsAdapter).toContain("focusChangeCount")

    expect(projectSpec).toContain("### Requirement: Проект показывает свою историю и диагностику")
    expect(projectSpec).toContain("#### Scenario: Пользователь открывает историю проекта")
  })
})
