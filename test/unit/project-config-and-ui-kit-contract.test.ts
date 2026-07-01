// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает config проекта"
// @openSpec  - "Пользователь редактирует title и id проекта"
// @openSpec  - "Пользователь меняет UI kit проекта из canonical списка"
// @openSpec  - "Пользователь видит, где хранится проект"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Prompt context использует project-level UI kit contract"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  applyProjectConfigDraft,
  buildProjectConfigDraft,
  validateProjectConfigDraft,
} from "../../lib/project/config-surface"
import { normalizeProject } from "../../lib/project/runtime"
import { buildTaskPromptContext } from "../../lib/task/prompt-context"
import {
  buildProjectConfigContractModel,
  listProjectUiKitOptions,
} from "../../components/desengine/project/projectSurface"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project config and ui kit contract", () => {
  it("даёт form-draft surface для проекта и сохраняет нормализованный contract", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Альфа",
      settings: {
        uiKitId: "shadcn",
      },
    })

    expect(buildProjectConfigDraft(project)).toEqual({
      id: "project-a",
      title: "Альфа",
      uiKitId: "shadcn",
    })

    const parsed = validateProjectConfigDraft({
      id: "project-b",
      title: "Бета",
      uiKitId: "ant",
    })
    expect(parsed).toEqual({
      ok: true,
      draft: {
        id: "project-b",
        title: "Бета",
        uiKitId: "ant",
      },
    })
    if (!parsed.ok) {
      throw new Error(parsed.message)
    }

    const saved = applyProjectConfigDraft(project, parsed.draft)
    expect(saved.id).toBe("project-b")
    expect(saved.title).toBe("Бета")
    expect(saved.settings).toEqual({
      uiKitId: "ant",
    })
  })

  it("явно строит selected ui kit contract и canonical kit list", () => {
    const project = normalizeProject({
      id: "project-b",
      title: "Бета",
      settings: {
        uiKitId: "ant",
      },
    })

    const model = buildProjectConfigContractModel(project)

    expect(model).toMatchObject({
      selectedUiKitId: "ant",
      selectedUiKitTitle: "Ant Design",
    })
    expect(model.promptPreviewContractJson).toContain('"project.uiKitId"')
    expect(model.promptPreviewContractJson).not.toContain("effectiveUiKitId")
    expect(listProjectUiKitOptions().map((kit) => kit.id)).toEqual(["none", "shadcn", "ant", "mui"])
  })

  it("оставляет prompt context на том же project-level ui kit contract", () => {
    const context = buildTaskPromptContext({
      taskId: "task-project-ui-kit",
      taskMaxLevel: 5,
      taskImages: null,
      level: {
        id: "level-2",
        number: 2,
        title: "Контракт UI kit",
        labId: "level-2",
        editableFileIds: ["component"],
      },
      project: normalizeProject({
        id: "project-c",
        title: "Гамма",
        settings: {
          uiKitId: "ant",
        },
      }),
    })

    expect(context.project).toMatchObject({
      uiKitId: "ant",
      uiKitTitle: "Ant Design",
    })
    expect(context.user).toMatchObject({
      designSystemId: "ant",
      designSystemName: "Ant Design",
    })
  })

  it("подключает project config surface к странице проекта без захода в task/workbench flow", () => {
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const projectConfigPanel = readProjectFile("components", "desengine", "project", "ProjectConfigPanel.tsx")
    const projectSurface = readProjectFile("components", "desengine", "project", "projectSurface.ts")
    const projectPage = readProjectFile("app", "projects", "[projectId]", "page.tsx")

    expect(projectOverview).toContain("ProjectConfigPanel")
    expect(projectOverview).toContain("onProjectSaved={state.replaceProject}")
    expect(projectConfigPanel).toContain("Название проекта")
    expect(projectConfigPanel).toContain("Идентификатор проекта")
    expect(projectConfigPanel).toContain("Локально в браузере")
    expect(projectConfigPanel).toContain("Связь с подсказками и предпросмотром")
    expect(projectConfigPanel).toContain("createBrowserProjectStorage")
    expect(projectSurface).toContain("buildProjectConfigContractModel")
    expect(projectSurface).toContain("listProjectUiKitOptions")
    expect(projectPage).toContain("readProjectHistoryDiagnostics")
    expect(projectPage).toContain("getTasks()")
    expect(projectPage).toContain("readProjectWorkflowReadout")
    expect(projectPage).toContain("workflowTaskCatalog={tasks.map((task) => ({ taskId: task.id, taskTitle: task.id }))}")
  })
})
