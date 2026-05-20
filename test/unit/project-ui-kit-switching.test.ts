// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Лаборатория создаёт локальный проект для preview"
// @openSpec  - "Пользователь переключает UI kit проекта без перезагрузки страницы"
// @openSpec  - "Пользователь включает режим html-tags"
// @openSpec  - "Лаборатория показывает диагностику несовместимости UI kit"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Sandpack preview использует project.uiKitId"
// @openSpec  - "Режим html-tags работает без UI kit"
// @openSpec  - "Preview показывает безопасный fallback при несовместимости проекта"

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

function buildPayload(component: string, uiKitId = "none") {
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
        uiMode: "html-tags",
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
      uiMode: "html-tags",
    })
    expect(normalizeProject({ id: " p ", title: " T ", uiKitId: "antd", uiMode: "native" })).toMatchObject({
      id: "p",
      title: "T",
      uiKitId: "ant",
      uiMode: "html-tags",
    })
    expect(normalizeProjectUiMode("что-то")).toBe("html-tags")
    expect(getProjectStorageKey("task-a")).toBe("desengine:project:task-a")
  })

  it("валидирует html-tags режим и допускает только HTML JSX-теги", () => {
    expect(validateHtmlTagsComponentSource(`export default function Component() { return <section><button>OK</button></section> }`)).toMatchObject({
      status: "compatible",
    })
    expect(validateHtmlTagsComponentSource(`import { Badge } from "@/components/ui/badge"; export default function Component() { return <Badge /> }`)).toMatchObject({
      status: "incompatible",
    })
    expect(validateHtmlTagsComponentSource(`export default function Component() { return <Card.Root /> }`)).toMatchObject({
      status: "incompatible",
    })
  })

  it("передаёт project.uiKitId в Sandpack payload и пересборку можно запускать query-state'ом", () => {
    const payload = buildPayload(`export default function Component() { return <div>HTML</div> }`, "ant")

    expect(payload.project).toMatchObject({
      id: "task-demo",
      uiKitId: "ant",
      uiMode: "html-tags",
      effectiveUiKitId: "ant",
      compatibility: { status: "compatible" },
    })
    expect(payload.customSetup.dependencies).toMatchObject({
      antd: expect.any(String),
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
    const workbench = readProjectFile("components", "desengine", "lab", "Workbench", "Workbench.tsx")
    const outRender = readProjectFile("components", "desengine", "lab", "InOut", "OutRender", "OutRender.tsx")

    expect(sandpackRoute).toContain('searchParams.get("uiKitId")')
    expect(sandpackRoute).toContain('searchParams.get("uiMode")')
    expect(sandpackRoute).toContain("buildSandpackPreviewPayload(sourceFiles, {")
    expect(workbench).toContain("getProjectStorageKey(taskItem.id)")
    expect(workbench).toContain("sandpackUiKitsConfig")
    expect(workbench).toContain("window.localStorage.setItem")
    expect(outRender).toContain("new URLSearchParams")
    expect(outRender).toContain("uiKitId: previewProject.uiKitId")
    expect(outRender).toContain('compatibility.status !== "incompatible"')
  })
})
