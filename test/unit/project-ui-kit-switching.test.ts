// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Лаборатория создаёт локальный проект для preview"
// @openSpec  - "Лаборатория сохраняет локальные project settings при rehydration"
// @openSpec  - "Пользователь переключает UI kit проекта без перезагрузки страницы"
// @openSpec  - "Пользователь включает режим html-tags"
// @openSpec  - "Лаборатория показывает диагностику несовместимости UI kit"
// @openSpec  - "Лаборатория показывает runtime-диагностику Sandpack preview"
// @openSpec  - "Лаборатория показывает итог project migration"
// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь создаёт первый проект в MVP workspace"
// @openSpec  - "Пользователь открывает lab в активном проекте"
// @openSpec  - "Пользователь переключает active project через project registry"
// @openSpec  - "Настройки preview сохраняются в project settings"
// @openSpec  - "Смена project UI kit запускает явную migration-операцию"
// @openSpec  - "Project migration не оставляет скрытое промежуточное состояние"
// @openSpec capability: storage-adapter
// @openSpec scenarios:
// @openSpec  - "Runtime читает активный проект"
// @openSpec  - "Storage backend ещё локальный"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Sandpack preview использует project.uiKitId"
// @openSpec  - "Режим html-tags работает без UI kit"
// @openSpec  - "Preview показывает безопасный fallback при несовместимости проекта"
// @openSpec  - "Preview поднимает runtime-ошибку Sandpack в host UI"
// @openSpec  - "Пользователь запускает project migration через service boundary"

import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"
import {
  completeProjectUiKitMigration,
  createProjectWorkspace,
  createDefaultProject,
  failProjectUiKitMigration,
  getProjectStorageKey,
  getProjectMigrationTarget,
  normalizeProject,
  normalizeProjectUiMode,
  projectNeedsUiKitMigration,
  serializeProjectWorkspace,
  startProjectUiKitMigration,
  validateHtmlTagsComponentSource,
} from "../../lib/project/runtime"
import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
  createBrowserProjectStorage,
  createMemoryProjectStorage,
  readBrowserStoredActiveProjectId,
  readBrowserStoredProject,
} from "../../lib/project/storage"

const utilsSource = `export function cn(...inputs: string[]) { return inputs.filter(Boolean).join(" ") }\n`

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

function buildPayload(component: string, uiKitId = "none", uiMode = "html-tags") {
  return buildSandpackPreviewPayload(
    {
      component,
      uiBadge: "export function Badge() { return null }\n",
      systemUtils: utilsSource,
    },
    {
      project: normalizeProject({
        id: "task-demo",
        title: "Demo",
        uiKitId,
        uiMode,
      }),
    },
  )
}

function createStorageMock(seed: Record<string, string> = {}): Storage {
  const state = new Map(Object.entries(seed))

  return {
    get length() {
      return state.size
    },
    clear() {
      state.clear()
    },
    getItem(key: string) {
      return state.get(key) ?? null
    },
    key(index: number) {
      return Array.from(state.keys())[index] ?? null
    },
    removeItem(key: string) {
      state.delete(key)
    },
    setItem(key: string, value: string) {
      state.set(key, value)
    },
  }
}

describe("project UI kit switching", () => {
  it("нормализует минимальный проект и ключ хранения лаборатории", () => {
    expect(createDefaultProject("task-a")).toMatchObject({
      id: "task-a",
      title: "Локальный проект",
      settings: {
        uiKitId: "shadcn",
        uiMode: "ui-kit",
      },
    })
    expect(normalizeProject({ id: " p ", title: " T ", uiKitId: "antd", uiMode: "native" })).toMatchObject({
      id: "p",
      title: "T",
      settings: {
        uiKitId: "ant",
        uiMode: "html-tags",
      },
    })
    expect(normalizeProject({ id: "p", title: "T", uiKitId: "none" })).toMatchObject({
      settings: {
        uiKitId: "none",
        uiMode: "html-tags",
      },
    })
    expect(normalizeProjectUiMode("что-то")).toBe("ui-kit")
    expect(getProjectStorageKey("task-a")).toBe("desengine:project:task-a")
    expect(createProjectWorkspace({ title: "Новый sandbox" })).toMatchObject({
      title: "Новый sandbox",
      settings: {
        uiKitId: "shadcn",
        uiMode: "ui-kit",
      },
    })
  })

  it("нормализует и сериализует canonical ProjectWorkspace с settings boundary", () => {
    const workspace = serializeProjectWorkspace({
      id: " project-1 ",
      title: " Workspace ",
      createdAt: "2026-05-20T10:00:00.000Z",
      updatedAt: "2026-05-20T10:05:00.000Z",
      settings: {
        uiKitId: "mui",
        uiMode: "html-tags",
      },
    })

    expect(workspace).toEqual({
      id: "project-1",
      title: "Workspace",
      createdAt: "2026-05-20T10:00:00.000Z",
      updatedAt: "2026-05-20T10:05:00.000Z",
      settings: {
        uiKitId: "mui",
        uiMode: "html-tags",
      },
      migration: {
        state: "idle",
        sourceUiKitId: "mui",
        sourceUiMode: "html-tags",
        targetUiKitId: "mui",
        targetUiMode: "html-tags",
        invalidationScope: "none",
        requiresReplay: false,
        message: "",
        startedAt: null,
        finishedAt: null,
      },
    })
    expect(normalizeProject({ id: "legacy", title: "Legacy", uiKitId: "ant", uiMode: "ui-kit" })).toMatchObject({
      settings: {
        uiKitId: "ant",
        uiMode: "ui-kit",
      },
    })
  })

  it("storage adapter создаёт registry, выбирает active project и скрывает backend", async () => {
    const storage = createMemoryProjectStorage()
    const firstProject = await storage.createProject({ title: "Проект A" })
    const secondProject = await storage.createProject({
      title: "Проект B",
      settings: {
        uiKitId: "ant",
        uiMode: "ui-kit",
      },
    })

    await storage.setActiveProjectId(secondProject.id)

    await expect(storage.getActiveProjectId()).resolves.toBe(secondProject.id)
    await expect(storage.getActiveProject()).resolves.toMatchObject({
      id: secondProject.id,
      title: "Проект B",
      settings: {
        uiKitId: "ant",
        uiMode: "ui-kit",
      },
    })
    await expect(storage.getProject(firstProject.id)).resolves.toMatchObject({
      id: firstProject.id,
      title: "Проект A",
    })
    await expect(storage.listProjects()).resolves.toHaveLength(2)
  })

  it("browser storage adapter мигрирует legacy localStorage project MVP в registry", async () => {
    const storageMock = createStorageMock({
      [getProjectStorageKey("task-a")]: JSON.stringify({
        uiKitId: "mui",
        uiMode: "ui-kit",
      }),
    })
    const storage = createBrowserProjectStorage({ storage: storageMock, taskId: "task-a" })

    await expect(storage.getProject("task-task-a")).resolves.toMatchObject({
      id: "task-task-a",
      title: "Проект task-a",
      settings: {
        uiKitId: "mui",
        uiMode: "ui-kit",
      },
    })
    expect(storageMock.getItem(PROJECT_REGISTRY_STORAGE_KEY)).toContain("task-task-a")
    await storage.setActiveProjectId("task-task-a")
    expect(storageMock.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY)).toBe("task-task-a")
  })

  it("синхронно читает active project из browser storage до hydration effect", () => {
    const storageMock = createStorageMock({
      [PROJECT_REGISTRY_STORAGE_KEY]: JSON.stringify([
        {
          id: "task-task-a",
          title: "Проект task-a",
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z",
          settings: {
            uiKitId: "none",
            uiMode: "html-tags",
          },
        },
      ]),
      [ACTIVE_PROJECT_ID_STORAGE_KEY]: "task-task-a",
    })

    expect(readBrowserStoredActiveProjectId(storageMock, "task-a")).toBe("task-task-a")
    expect(readBrowserStoredProject(storageMock, "task-task-a", "task-a")).toMatchObject({
      id: "task-task-a",
      title: "Проект task-a",
      settings: {
        uiKitId: "none",
        uiMode: "html-tags",
      },
    })
  })

  it("browser storage выбирает первый проект, если active project ещё не задан или сломан", () => {
    const storageMock = createStorageMock({
      [PROJECT_REGISTRY_STORAGE_KEY]: JSON.stringify([
        {
          id: "project-a",
          title: "Проект A",
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z",
          settings: {
            uiKitId: "shadcn",
            uiMode: "ui-kit",
          },
        },
        {
          id: "project-b",
          title: "Проект B",
          createdAt: "2026-05-28T00:00:00.000Z",
          updatedAt: "2026-05-28T00:00:00.000Z",
          settings: {
            uiKitId: "ant",
            uiMode: "ui-kit",
          },
        },
      ]),
      [ACTIVE_PROJECT_ID_STORAGE_KEY]: "missing-project",
    })

    expect(readBrowserStoredActiveProjectId(storageMock, "task-a")).toBe("project-a")
  })

  it("browser storage сохраняет реальный uiKitId/uiMode без отката к shadcn", async () => {
    const storageMock = createStorageMock()
    const storage = createBrowserProjectStorage({ storage: storageMock, taskId: "task-a" })
    const project = normalizeProject({
      id: "task-task-a",
      title: "Проект task-a",
      settings: {
        uiKitId: "none",
        uiMode: "html-tags",
      },
    })

    await storage.saveProject(project)

    expect(storageMock.getItem(PROJECT_REGISTRY_STORAGE_KEY)).toContain('"uiKitId":"none"')
    expect(storageMock.getItem(PROJECT_REGISTRY_STORAGE_KEY)).toContain('"uiMode":"html-tags"')
    await expect(storage.getProject("task-task-a")).resolves.toMatchObject({
      settings: {
        uiKitId: "none",
        uiMode: "html-tags",
      },
    })
  })

  it("фиксирует project migration как отдельный persisted status", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Проект A",
      settings: {
        uiKitId: "shadcn",
        uiMode: "ui-kit",
      },
    })
    const target = getProjectMigrationTarget("ant")

    expect(projectNeedsUiKitMigration(project, target)).toBe(true)

    const pendingProject = startProjectUiKitMigration(project, target)
    expect(pendingProject.migration).toMatchObject({
      state: "pending",
      sourceUiKitId: "shadcn",
      targetUiKitId: "ant",
    })
    expect(pendingProject.settings).toMatchObject({
      uiKitId: "shadcn",
      uiMode: "ui-kit",
    })

    const completedProject = completeProjectUiKitMigration(project, target, {
      invalidationScope: "current-level",
      requiresReplay: true,
      message: "Текущий уровень нужно пройти заново.",
    })
    expect(completedProject.settings).toMatchObject({
      uiKitId: "ant",
      uiMode: "ui-kit",
    })
    expect(completedProject.migration).toMatchObject({
      state: "completed",
      invalidationScope: "current-level",
      requiresReplay: true,
      message: "Текущий уровень нужно пройти заново.",
    })

    const failedProject = failProjectUiKitMigration(project, target, "Migration не завершилась")
    expect(failedProject.settings).toMatchObject({
      uiKitId: "shadcn",
      uiMode: "ui-kit",
    })
    expect(failedProject.migration).toMatchObject({
      state: "failed",
      targetUiKitId: "ant",
      message: "Migration не завершилась",
    })
  })

  it("валидирует html-tags режим и допускает только HTML JSX-теги", () => {
    expect(validateHtmlTagsComponentSource(`export default function Component() { return <section><button>OK</button></section> }`)).toMatchObject({
      status: "compatible",
    })
    expect(validateHtmlTagsComponentSource(`import { Badge } from "@/components/ui/badge"; export default function Component() { return <Badge /> }`)).toMatchObject({
      status: "incompatible",
    })
    expect(validateHtmlTagsComponentSource(`import "antd/dist/reset.css"; export default function Component() { return <div /> }`)).toMatchObject({
      status: "incompatible",
    })
    expect(validateHtmlTagsComponentSource(`import Button from "antd/es/button"; export default function Component() { return <div /> }`)).toMatchObject({
      status: "incompatible",
    })
    expect(validateHtmlTagsComponentSource(`export default function Component() { return <Card.Root /> }`)).toMatchObject({
      status: "incompatible",
    })
    expect(validateHtmlTagsComponentSource(`// <Badge />\nconst example = "<Button />"; export default function Component() { return <div>HTML</div> }`)).toMatchObject({
      status: "compatible",
    })
  })

  it("передаёт project.uiKitId в Sandpack payload и пересборку можно запускать query-state'ом", async () => {
    const payload = await buildPayload(`export default function Component() { return <div>HTML</div> }`, "ant", "ui-kit")

    expect(payload.project).toMatchObject({
      id: "task-demo",
      settings: {
        uiKitId: "ant",
        uiMode: "ui-kit",
      },
      effectiveUiKitId: "ant",
      compatibility: { status: "compatible" },
    })
    expect(payload.customSetup.dependencies).toMatchObject({
      antd: expect.any(String),
      "@rc-component/picker": expect.any(String),
    })
    expect(payload.files["/src/index.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('import "antd/dist/reset.css";'),
    }))
  })

  it("режим html-tags стабильно работает без UI kit", async () => {
    const payload = await buildPayload(`export default function Component() { return <main><h1>HTML</h1></main> }`, "none")

    expect(payload.project.effectiveUiKitId).toBe("none")
    expect(payload.customSetup.dependencies).not.toMatchObject({
      antd: expect.any(String),
      "@mui/material": expect.any(String),
    })
    expect(payload.files["/src/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("<main>"),
    }))
  })

  it("режим ui-kit сохраняет shadcn preview для существующих компонентов", async () => {
    const payload = await buildSandpackPreviewPayload(
      {
        component: `import { Badge } from "@/components/ui/badge"; export default function Component() { return <Badge /> }`,
        uiBadge: "export function Badge() { return <span /> }\n",
        systemUtils: utilsSource,
      },
      {
        project: normalizeProject({
          id: "task-demo",
          title: "Demo",
          uiKitId: "shadcn",
          uiMode: "ui-kit",
        }),
      },
    )

    expect(payload.project.compatibility).toMatchObject({ status: "compatible" })
    expect(payload.files["/src/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "./components/ui/badge"'),
    }))
    expect(payload.files["/src/Component.tsx"]).not.toEqual(expect.objectContaining({
      code: expect.stringContaining("Preview переключён в безопасный режим"),
    }))
  })

  it("при несовместимости html-tags отдаёт безопасный fallback вместо падающего компонента", async () => {
    const payload = await buildPayload(`import { Badge } from "@/components/ui/badge"; export default function Component() { return <Badge /> }`, "none")

    expect(payload.project.compatibility).toMatchObject({ status: "incompatible" })
    expect(payload.files["/src/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("Preview переключён в безопасный режим"),
    }))
    expect(payload.files["/src/Component.tsx"]).not.toEqual(expect.objectContaining({
      code: expect.stringContaining("@/components/ui/badge"),
    }))
  })

  it("route и Workbench держат project как boundary между UI и Sandpack payload", () => {
    const sandpackRoute = readProjectFile("app", "api", "tasks", "[taskId]", "sandpack", "route.ts")
    const hintRoute = readProjectFile("app", "api", "tasks", "[taskId]", "hint", "route.ts")
    const checkRoute = readProjectFile("app", "api", "tasks", "[taskId]", "check", "route.ts")
    const migrationRoute = readProjectFile("app", "api", "tasks", "[taskId]", "project-migration", "route.ts")
    const workbench = readProjectFile("components", "desengine", "lab", "Workbench", "Workbench.tsx")
    const workbenchView = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchView.tsx")
    const workbenchContent = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "WorkbenchContent.tsx",
    )
    const workbenchController = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "useWorkbenchController.ts",
    )
    const workbenchProjectScope = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "useWorkbenchProjectScope.ts",
    )
    const workbenchProjectShell = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "WorkbenchProjectShell.tsx",
    )
    const workbenchHeader = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "WorkbenchHeader.tsx",
    )
    const workbenchSurface = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "workbenchSurface.ts",
    )
    const workbenchSurfaceSummary = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "WorkbenchSurfaceSummary.tsx",
    )
    const workbenchPersistence = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "useWorkbenchPersistence.ts",
    )
    const workbenchTaskActions = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "useWorkbenchTaskActions.ts",
    )
    const outRender = readProjectFile("components", "desengine", "lab", "InOut", "OutRender", "OutRender.tsx")

    expect(sandpackRoute).toContain('searchParams.get("uiKitId")')
    expect(sandpackRoute).toContain('searchParams.get("uiMode")')
    expect(hintRoute).toContain("getTaskLevelHint")
    expect(hintRoute).toContain('searchParams.get("uiKitId")')
    expect(hintRoute).toContain('searchParams.get("uiMode")')
    expect(checkRoute).toContain("normalizeProject")
    expect(checkRoute).toContain("await request.json()")
    expect(migrationRoute).toContain("migrateProjectUiKitRuntime")
    expect(migrationRoute).toContain("normalizeProjectMigrationTarget")
    expect(migrationRoute).toContain("project: normalizeProject")
    expect(migrationRoute).toContain("target: normalizeProjectMigrationTarget")
    expect(migrationRoute).toContain('invalidationScope: result.invalidationScope')
    expect(sandpackRoute).toContain("readCachedStablePreviewSourceFiles")
    expect(sandpackRoute).toContain("stablePreviewSourceCache")
    expect(sandpackRoute).toContain("buildSandpackPreviewPayload(sourceFiles, {")
    expect(workbench).toContain("useWorkbenchController")
    expect(workbenchProjectScope).toContain("createBrowserProjectStorage")
    expect(workbenchProjectScope).toContain("sandpackUiKitsConfig")
    expect(workbenchProjectScope).toContain("function createProjectPlaceholder(taskId: string)")
    expect(workbenchProjectScope).toContain('createdAt: "1970-01-01T00:00:00.000Z"')
    expect(workbenchProjectScope).toContain('updatedAt: "1970-01-01T00:00:00.000Z"')
    expect(workbenchProjectScope).toContain('uiKitId: "none"')
    expect(workbenchProjectScope).toContain("const [project, setProject] = useState<Project>(fallbackProject)")
    expect(workbenchProjectScope).toContain("const [projects, setProjects] = useState<Project[]>([fallbackProject])")
    expect(workbenchProjectScope).toContain("const [projectReady, setProjectReady] = useState(false)")
    expect(workbenchProjectScope).toContain("setProjectReady(false)")
    expect(workbenchProjectScope).toContain("setProjectReady(true)")
    expect(workbenchProjectScope).toContain("projectStorage.getActiveProject")
    expect(workbenchProjectScope).toContain("handleProjectCreate")
    expect(workbenchProjectScope).toContain("handleProjectSelect")
    expect(workbenchProjectScope).toContain("startProjectUiKitMigration")
    expect(workbenchProjectScope).toContain("completeProjectUiKitMigration")
    expect(workbenchProjectScope).toContain("postProjectMigration")
    expect(workbenchProjectScope).toContain("postProjectMigration(props.taskItem.id, pendingProject, target)")
    expect(workbenchController).toContain("/hint?")
    expect(workbenchProjectScope).toContain("saveBeforeAction")
    expect(workbenchProjectScope).toContain("fetchTaskScopeSnapshot")
    expect(workbenchProjectScope).toContain('`/api/tasks/${encodeURIComponent(taskId)}?${params.toString()}`')
    expect(workbenchProjectScope).toContain("replaceTaskData(data.taskData)")
    expect(workbenchProjectScope).toContain('}, "component"))')
    expect(workbenchProjectScope).toContain("await projectState.selectProject(previousProjectId)")
    expect(workbenchProjectScope).toContain("projectStorage?.saveProject")
    expect(workbenchTaskActions).toContain("/check")
    expect(workbenchTaskActions).toContain("/project-migration")
    expect(workbenchTaskActions).toContain("JSON.stringify({ project })")
    expect(workbenchTaskActions).toContain("JSON.stringify({ project, target })")
    expect(workbenchPersistence).toContain("/api/tasks/${taskId}/files")
    expect(workbenchProjectShell).toContain("Project workspace")
    expect(workbenchProjectShell).toContain("Active project")
    expect(workbenchContent).toContain("onCreateProject={controller.project.handleProjectCreate}")
    expect(workbenchProjectShell).toContain("Загружаем active project из локального registry")
    expect(workbenchContent).toContain("Загружаем preview для active project…")
    expect(workbenchView).toContain("interactionDisabled={!controller.project.projectReady}")
    expect(workbenchProjectShell).toContain("Подтвердить migration")
    expect(workbenchProjectShell).toContain("Migration проекта:")
    expect(workbenchHeader).toContain("Рабочая поверхность")
    expect(workbenchHeader).toContain("Шаг workflow: уровень")
    expect(workbenchSurface).toContain("buildTaskWorkflowArtifactProjection")
    expect(workbenchSurface).toContain("workflowStepId")
    expect(workbenchSurface).toContain("workbenchDefinitionTitle")
    expect(workbenchSurfaceSummary).toContain("Workbench surface")
    expect(workbenchSurfaceSummary).toContain("project -&gt; task -&gt; workflow step -&gt; workbench")
    expect(outRender).toContain("new URLSearchParams")
    expect(outRender).toContain("uiKitId: previewProject.settings.uiKitId")
    expect(outRender).toContain("ProjectMigrationNotice")
    expect(outRender).toContain('compatibility.status === "incompatible"')
    expect(outRender).toContain("useSandpack")
    expect(outRender).toContain("SandpackRuntimeDiagnosticsNotice")
    expect(outRender).toContain("sandpack.error")

    const storage = readProjectFile("lib", "project", "storage.ts")
    expect(storage).toContain("type ProjectStorage = {")
    expect(storage).toContain("listProjects(): Promise<ProjectWorkspace[]>")
    expect(storage).toContain("getActiveProject(): Promise<ProjectWorkspace | null>")
    expect(storage).toContain("createProject(input: CreateProjectWorkspaceInput): Promise<ProjectWorkspace>")
    expect(storage).toContain("getActiveProjectId(): Promise<string | null>")
    expect(storage).toContain("readLegacyTaskProject")
    expect(storage).toContain(PROJECT_REGISTRY_STORAGE_KEY)
    expect(storage).toContain(ACTIVE_PROJECT_ID_STORAGE_KEY)
  })
})
