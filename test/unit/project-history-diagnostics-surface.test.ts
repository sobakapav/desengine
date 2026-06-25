// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает историю проекта"
// @openSpec  - "Пользователь видит reset след проекта"

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
  it("строит explainability-friendly model из project-scoped history snapshot", () => {
    const snapshot: ProjectHistoryDiagnosticsSnapshot = {
      projectId: "project-a",
      prompts: [
        {
          taskId: "intro-card",
          createdAt: "2026-06-15T10:00:00.000Z",
          levelNumber: 2,
          textPreview: "Сделай карточку плотнее и сократи отступы.",
          changedFileNames: ["src/App.tsx", "src/styles.css"],
          provider: "openai",
        },
      ],
      checkResults: [
        {
          taskId: "intro-card",
          createdAt: "2026-06-15T10:05:00.000Z",
          levelNumber: 2,
          kind: "passed",
          passed: true,
          messagePreview: "Проверка пройдена.",
        },
      ],
      resetSnapshots: [
        {
          taskId: "intro-card",
          levelNumber: 2,
          editableFileCount: 2,
          capturedFiles: ["component", "styles"],
        },
      ],
      runtimeContexts: [
        {
          taskId: "intro-card",
          runtimeFileCount: 2,
          runtimeFileNames: ["Component.tsx", "styles.css"],
          promptCount: 1,
          lastPromptAt: "2026-06-15T10:00:00.000Z",
          hasCheckResult: true,
          resetSnapshotCount: 1,
          lastActivityAt: "2026-06-15T10:05:00.000Z",
        },
      ],
      summary: buildProjectHistoryDiagnosticsSummary({
        prompts: [
          {
            taskId: "intro-card",
            createdAt: "2026-06-15T10:00:00.000Z",
            levelNumber: 2,
            textPreview: "Сделай карточку плотнее и сократи отступы.",
            changedFileNames: ["src/App.tsx", "src/styles.css"],
            provider: "openai",
          },
        ],
        checkResults: [
          {
            taskId: "intro-card",
            createdAt: "2026-06-15T10:05:00.000Z",
            levelNumber: 2,
            kind: "passed",
            passed: true,
            messagePreview: "Проверка пройдена.",
          },
        ],
        resetSnapshots: [
          {
            taskId: "intro-card",
            levelNumber: 2,
            editableFileCount: 2,
            capturedFiles: ["component", "styles"],
          },
        ],
        runtimeContexts: [
          {
            taskId: "intro-card",
            runtimeFileCount: 2,
            runtimeFileNames: ["Component.tsx", "styles.css"],
            promptCount: 1,
            lastPromptAt: "2026-06-15T10:00:00.000Z",
            hasCheckResult: true,
            resetSnapshotCount: 1,
            lastActivityAt: "2026-06-15T10:05:00.000Z",
          },
        ],
      }),
    }

    const model = buildProjectHistoryDiagnosticsModel(snapshot)

    expect(model.summary).toMatchObject({
      taskCountLabel: "1 задача",
      promptCountLabel: "1 prompt",
      checkResultCountLabel: "1 check-result",
      resetSnapshotCountLabel: "1 reset snapshot",
      runtimeFileCountLabel: "2 runtime-файла",
      lastActivityLabel: "2026-06-15 10:05 UTC",
    })
    expect(model.prompts[0]).toMatchObject({
      taskId: "intro-card",
      levelLabel: "Уровень 2",
      changedFilesLabel: "src/App.tsx, src/styles.css",
      providerLabel: "openai",
    })
    expect(model.checkResults[0]?.statusLabel).toBe("Проверка пройдена")
    expect(model.resetSnapshots[0]?.capturedFilesLabel).toBe("component, styles")
    expect(model.runtimeContexts[0]?.runtimeFilesPreview).toBe("Component.tsx, styles.css")
  })

  it("обрезает шумный prompt text и подключает history surface к project page", () => {
    expect(clipTextPreview("  Один   два   три  ", 12)).toBe("Один два три")
    expect(clipTextPreview("Очень длинный prompt для истории проекта", 16)).toBe("Очень длинный p…")

    const projectPage = readProjectFile("app", "projects", "[projectId]", "page.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const diagnosticsPanel = readProjectFile("components", "desengine", "project", "ProjectHistoryDiagnosticsPanel.tsx")
    const diagnosticsAdapter = readProjectFile("lib", "project", "history-diagnostics.ts")
    const projectSpec = readProjectFile("openspec", "specs", "projects", "spec.md")

    expect(projectPage).toContain("readProjectHistoryDiagnostics")
    expect(projectPage).toContain("historyDiagnostics={historyDiagnostics}")

    expect(projectOverview).toContain("ProjectHistoryDiagnosticsPanel")
    expect(projectOverview).toContain("historyDiagnostics={historyDiagnostics}")

    expect(diagnosticsPanel).toContain("История и диагностика проекта")
    expect(diagnosticsPanel).toContain("Reset snapshots")
    expect(diagnosticsPanel).toContain("Рабочий контекст проекта")

    expect(diagnosticsAdapter).toContain("prompt-history.json")
    expect(diagnosticsAdapter).toContain("check-result.json")
    expect(diagnosticsAdapter).toContain(".level-reset")

    expect(projectSpec).toContain("### Requirement: Проект показывает свою историю и диагностику")
    expect(projectSpec).toContain("#### Scenario: Пользователь открывает историю проекта")
  })
})
