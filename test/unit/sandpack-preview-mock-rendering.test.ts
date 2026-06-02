// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Preview собирает mock-данные из `mock.ts`"
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import { describe, expect, it } from "vitest"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"
import {
  badgeSource,
  readLevel5AppTemplateOptions,
  readSandpackFileCode,
  renderBuiltLevel5App,
  utilsSource,
} from "./sandpack-preview.helpers"

describe("buildSandpackPreviewPayload mock rendering", () => {
  it("сохраняет level-5 template с прямым рендером mock-массива и runtime boundary", async () => {
    const appTemplate = await readLevel5AppTemplateOptions()
    const payload = await buildSandpackPreviewPayload(
      {
        component: `export default function Component({ title }: { title?: string }) {
  return <div>{title ?? "empty"}</div>;
}
`,
        mock: `export const mock = [{ title: "Первый" }, { title: "Второй" }];
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      { appTemplate },
    )
    const appSource = readSandpackFileCode(payload.files["/src/App.tsx"] as { code: string })
    const html = renderBuiltLevel5App({
      appSource,
      mockModule: {
        mock: [{ title: "Первый" }, { title: "Второй" }],
      },
    })

    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("Array.isArray(mockList)"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("previewPropsList.map"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("<PreviewRuntimeContractBoundary key={index}>"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("<Component {...previewProps} />"),
    }))
    expect((html.match(/data-preview-component="true"/g) ?? [])).toHaveLength(2)
    expect(html).toContain("Первый")
    expect(html).toContain("Второй")
  })

  it("рендерит все object exports из mock.ts и игнорирует mock-массив, если есть named object mocks", async () => {
    const appTemplate = await readLevel5AppTemplateOptions()
    const payload = await buildSandpackPreviewPayload(
      {
        component: `export default function Component({ title }: { title?: string }) {
  return <div>{title ?? "empty"}</div>;
}
`,
        mock: `export const mockProps = { title: "Одиночный" };
export const alternativeMockProps = { title: "Второй объект" };
export const mock = [{ title: "Первый" }, { title: "Второй" }];
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      { appTemplate },
    )
    const appSource = readSandpackFileCode(payload.files["/src/App.tsx"] as { code: string })
    const html = renderBuiltLevel5App({
      appSource,
      mockModule: {
        mockProps: { title: "Одиночный" },
        alternativeMockProps: { title: "Второй объект" },
        mock: [{ title: "Первый" }, { title: "Второй" }],
      },
    })

    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('import * as mockModule from "./mock"'),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.not.stringContaining('import { mock } from "./mock"'),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("<Component {...previewProps} />"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("Object.entries(mockModule)"),
    }))
    expect((html.match(/data-preview-component="true"/g) ?? [])).toHaveLength(2)
    expect(html).toContain("Одиночный")
    expect(html).toContain("Второй объект")
    expect(html).not.toContain(">Первый<")
    expect(html).not.toContain(">Второй<")
  })

  it("рендерит все object-константы из mock.ts, если нет явного mockProps или mock", async () => {
    const appTemplate = await readLevel5AppTemplateOptions()
    const payload = await buildSandpackPreviewPayload(
      {
        component: `export default function Component({ title }: { title?: string }) {
  return <div>{title ?? "empty"}</div>;
}
`,
        mock: `export const mockPropsPrimary = { title: "Первый" };
export const mockPropsSecondary = { title: "Второй" };
export const mockPropsCompleted = { title: "Третий" };
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      { appTemplate },
    )
    const appSource = readSandpackFileCode(payload.files["/src/App.tsx"] as { code: string })
    const html = renderBuiltLevel5App({
      appSource,
      mockModule: {
        mockPropsPrimary: { title: "Первый" },
        mockPropsSecondary: { title: "Второй" },
        mockPropsCompleted: { title: "Третий" },
      },
    })

    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("Object.entries(mockModule)"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('exportName !== "default" && exportName !== "mock"'),
    }))
    expect((html.match(/data-preview-component="true"/g) ?? [])).toHaveLength(3)
    expect(html).toContain("Первый")
    expect(html).toContain("Второй")
    expect(html).toContain("Третий")
  })
})
