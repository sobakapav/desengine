// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Лаборатория создаёт локальный проект для preview"
// @openSpec  - "Пользователь переключает UI kit проекта без перезагрузки страницы"
// @openSpec  - "Пользователь включает режим html-tags"
// @openSpec  - "Лаборатория показывает диагностику несовместимости UI kit"
// @openSpec  - "Лаборатория показывает runtime-диагностику Sandpack preview"
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
  validateHtmlTagsComponentSource,
} from "../../lib/project/runtime"

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

describe("project UI kit switching", () => {
  it("нормализует минимальный проект и ключ хранения лаборатории", () => {
    expect(createDefaultProject("task-a")).toMatchObject({
      id: "task-a",
      title: "Локальный проект",
      uiKitId: "shadcn",
      uiMode: "ui-kit",
    })
    expect(normalizeProject({ id: " p ", title: " T ", uiKitId: "antd", uiMode: "native" })).toMatchObject({
      id: "p",
      title: "T",
      uiKitId: "ant",
      uiMode: "html-tags",
    })
    expect(normalizeProject({ id: "p", title: "T", uiKitId: "none" })).toMatchObject({
      uiKitId: "none",
      uiMode: "html-tags",
    })
    expect(normalizeProjectUiMode("что-то")).toBe("ui-kit")
    expect(getProjectStorageKey("task-a")).toBe("desengine:project:task-a")
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
      uiKitId: "ant",
      uiMode: "ui-kit",
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
    expect(workbenchController).toContain("getProjectStorageKey(taskId)")
    expect(workbenchController).toContain("sandpackUiKitsConfig")
    expect(workbenchController).toContain("/hint?")
    expect(workbenchController).toContain("/check")
    expect(workbenchController).toContain("JSON.stringify({ project })")
    expect(workbenchController).toContain("window.localStorage.setItem")
    expect(workbenchView).toContain('uiMode: nextUiKitId === "none" ? "html-tags" : "ui-kit"')
    expect(outRender).toContain("new URLSearchParams")
    expect(outRender).toContain("uiKitId: previewProject.uiKitId")
    expect(outRender).toContain('compatibility.status !== "incompatible"')
    expect(outRender).toContain("useSandpack")
    expect(outRender).toContain("SandpackRuntimeDiagnosticsNotice")
    expect(outRender).toContain("sandpack.error")
  })
})
