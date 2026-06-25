// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь отключает UI kit"
// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь создаёт первый проект в MVP workspace"
// @openSpec  - "Пользователь переключает active project через project registry"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("ui kit switcher visibility", () => {
  it("показывает project workspace controls в выделенном project shell Workbench UI", () => {
    const source = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchProjectShell.tsx")

    expect(source).toContain("Проект работы")
    expect(source).toContain("Активный проект")
    expect(source).toContain("Новый проект")
    expect(source).toContain("export function WorkbenchProjectSettings")
    expect(source).toContain("Загружаем активный проект из локального списка")
    expect(source).toContain("Переключить проект на другой UI kit?")
    expect(source).toContain("Настройки предпросмотра берутся из настроек проекта")
  })

  it("форматирует updatedAt детерминированно внутри project shell без locale-зависимой гидрации", () => {
    const source = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchProjectShell.tsx")

    expect(source).toContain("function formatProjectUpdatedAt(updatedAt: string)")
    expect(source).toContain('parsedDate.toISOString()')
    expect(source).toContain('return `${day}.${month}.${year}, ${hours}:${minutes} UTC`')
    expect(source).not.toContain('toLocaleString("ru-RU")')
  })

  it("инициализирует project summary одинаковым fallback в отдельном project scope до hydration effect", () => {
    const source = readProjectFile("components", "desengine", "lab", "Workbench", "useWorkbenchProjectScope.ts")
    const sharedSource = readProjectFile("components", "desengine", "lab", "Workbench", "projectScopeShared.ts")

    expect(sharedSource).toContain("function createProjectPlaceholder(taskId: string)")
    expect(sharedSource).toContain('createdAt: "1970-01-01T00:00:00.000Z"')
    expect(sharedSource).toContain('updatedAt: "1970-01-01T00:00:00.000Z"')
    expect(sharedSource).toContain('uiKitId: "none"')
    expect(source).toContain("const fallbackProject = createFallbackProject(taskId)")
    expect(source).toContain("const [project, setProject] = useState<Project>(fallbackProject)")
    expect(source).toContain("const [projects, setProjects] = useState<Project[]>([fallbackProject])")
    expect(source).toContain("const [projectReady, setProjectReady] = useState(false)")
    expect(source).toContain("setProjectReady(false)")
    expect(source).toContain("setProjectReady(true)")
    expect(source).not.toContain("readInitialProject()")
    expect(source).not.toContain("readInitialProjects()")
    expect(sharedSource).not.toContain("readBrowserStoredActiveProjectId")
    expect(sharedSource).not.toContain("readBrowserStoredProject")
    expect(sharedSource).not.toContain("readBrowserStoredProjects")
  })

  it("удерживает Workbench как consumer project scope через отдельный hook seam", () => {
    const controllerSource = readProjectFile("components", "desengine", "lab", "Workbench", "useWorkbenchController.ts")
    const projectScopeSource = readProjectFile("components", "desengine", "lab", "Workbench", "useWorkbenchProjectScope.ts")
    const sharedSource = readProjectFile("components", "desengine", "lab", "Workbench", "projectScopeShared.ts")
    const runtimeSource = readProjectFile("components", "desengine", "lab", "Workbench", "projectScopeRuntime.ts")

    expect(controllerSource).toContain('import { useProjectController, useWorkbenchProjectScope } from "./useWorkbenchProjectScope"')
    expect(controllerSource).toContain("const projectState = useProjectController(props.taskItem.id)")
    expect(controllerSource).toContain("const project = useWorkbenchProjectScope({")
    expect(projectScopeSource).toContain('} from "./projectScopeShared"')
    expect(projectScopeSource).toContain('} from "./projectScopeRuntime"')
    expect(sharedSource).toContain("async function refreshProjectControllerState")
    expect(sharedSource).toContain("async function createProjectInScope")
    expect(sharedSource).toContain("async function selectProjectInScope")
    expect(runtimeSource).toContain("async function rehydrateTaskScopeRuntime")
    expect(runtimeSource).toContain("async function handleProjectSelection")
    expect(runtimeSource).toContain("async function handleProjectCreation")
    expect(runtimeSource).toContain("async function migrateProjectUiKitInScope")
  })
})
