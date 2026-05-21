// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Лаборатория создаёт локальный проект для preview"
// @openSpec  - "Пользователь переключает UI kit проекта без перезагрузки страницы"
// @openSpec  - "Пользователь включает режим html-tags"
// @openSpec  - "Лаборатория показывает диагностику несовместимости UI kit"
// @openSpec  - "Лаборатория показывает runtime-диагностику Sandpack preview"
// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает lab в активном проекте"
// @openSpec  - "Настройки preview сохраняются в project settings"
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

import { describe, expect, it } from "vitest"
import fs from "node:fs"
import path from "node:path"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"
import {
  createDefaultProject,
  getProjectStorageKey,
  normalizeProject,
  normalizeProjectUiMode,
  serializeProjectWorkspace,
  validateHtmlTagsComponentSource,
} from "../../lib/project/runtime"
import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
  createBrowserProjectStorage,
  createMemoryProjectStorage,
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
    })
    expect(normalizeProject({ id: "legacy", title: "Legacy", uiKitId: "ant", uiMode: "ui-kit" })).toMatchObject({
      settings: {
        uiKitId: "ant",
        uiMode: "ui-kit",
      },
    })
  })

  it("storage adapter сохраняет registry, active project и скрывает backend", async () => {
    const storage = createMemoryProjectStorage()
    const project = normalizeProject({
      id: "task-a",
      title: "Проект A",
      settings: {
        uiKitId: "ant",
        uiMode: "ui-kit",
      },
    })

    await storage.saveProject(project)
    await storage.setActiveProjectId(project.id)

    await expect(storage.getActiveProjectId()).resolves.toBe("task-a")
    await expect(storage.getProject("task-a")).resolves.toMatchObject({
      id: "task-a",
      settings: {
        uiKitId: "ant",
        uiMode: "ui-kit",
      },
    })
    await expect(storage.listProjects()).resolves.toHaveLength(1)
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

  it("передаёт project.uiKitId в Sandpack payload и пересборку можно запускать query-state'ом", () => {
    const payload = buildPayload(`export default function Component() { return <div>HTML</div> }`, "ant", "ui-kit")

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
    expect(payload.files["/index.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('import "antd/dist/reset.css";'),
    }))
  })

  it("режим html-tags стабильно работает без UI kit", () => {
    const payload = buildPayload(`export default function Component() { return <main><h1>HTML</h1></main> }`, "none")

    expect(payload.project.effectiveUiKitId).toBe("none")
    expect(payload.customSetup.dependencies).not.toMatchObject({
      antd: expect.any(String),
      "@mui/material": expect.any(String),
    })
    expect(payload.files["/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("<main>"),
    }))
  })

  it("режим ui-kit сохраняет shadcn preview для существующих компонентов", () => {
    const payload = buildSandpackPreviewPayload(
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
    expect(payload.files["/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "./components/ui/badge"'),
    }))
    expect(payload.files["/Component.tsx"]).not.toEqual(expect.objectContaining({
      code: expect.stringContaining("Preview переключён в безопасный режим"),
    }))
  })

  it("при несовместимости html-tags отдаёт безопасный fallback вместо падающего компонента", () => {
    const payload = buildPayload(`import { Badge } from "@/components/ui/badge"; export default function Component() { return <Badge /> }`, "none")

    expect(payload.project.compatibility).toMatchObject({ status: "incompatible" })
    expect(payload.files["/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("Preview переключён в безопасный режим"),
    }))
    expect(payload.files["/Component.tsx"]).not.toEqual(expect.objectContaining({
      code: expect.stringContaining("@/components/ui/badge"),
    }))
  })

  it("route и Workbench держат project как boundary между UI и Sandpack payload", () => {
    const sandpackRoute = readProjectFile("app", "api", "tasks", "[taskId]", "sandpack", "route.ts")
    const hintRoute = readProjectFile("app", "api", "tasks", "[taskId]", "hint", "route.ts")
    const checkRoute = readProjectFile("app", "api", "tasks", "[taskId]", "check", "route.ts")
    const workbench = readProjectFile("components", "desengine", "lab", "Workbench", "Workbench.tsx")
    const workbenchView = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchView.tsx")
    const workbenchController = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Workbench",
      "useWorkbenchController.ts",
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
    expect(sandpackRoute).toContain("buildSandpackPreviewPayload(sourceFiles, {")
    expect(workbench).toContain("useWorkbenchController")
    expect(workbenchController).toContain("createBrowserProjectStorage")
    expect(workbenchController).toContain("sandpackUiKitsConfig")
    expect(workbenchController).toContain("/hint?")
    expect(workbenchController).toContain("projectStorage.saveProject")
    expect(workbenchTaskActions).toContain("/check")
    expect(workbenchTaskActions).toContain("JSON.stringify({ project })")
    expect(workbenchPersistence).toContain("/api/tasks/${taskId}/files")
    expect(workbenchView).toContain('uiMode: nextUiKitId === "none" ? "html-tags" : "ui-kit"')
    expect(outRender).toContain("new URLSearchParams")
    expect(outRender).toContain("uiKitId: previewProject.settings.uiKitId")
    expect(outRender).toContain('compatibility.status !== "incompatible"')
    expect(outRender).toContain("useSandpack")
    expect(outRender).toContain("SandpackRuntimeDiagnosticsNotice")
    expect(outRender).toContain("sandpack.error")

    const storage = readProjectFile("lib", "project", "storage.ts")
    expect(storage).toContain("type ProjectStorage = {")
    expect(storage).toContain("listProjects(): Promise<ProjectWorkspace[]>")
    expect(storage).toContain("getActiveProjectId(): Promise<string | null>")
    expect(storage).toContain("readLegacyTaskProject")
    expect(storage).toContain(PROJECT_REGISTRY_STORAGE_KEY)
    expect(storage).toContain(ACTIVE_PROJECT_ID_STORAGE_KEY)
  })
})
