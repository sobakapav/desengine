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
      code: expect.stringContaining("const previewMock = mockModule.mock"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("Array.isArray(previewMock)"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("{previewMock.map((item, index) => ("),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("<Component key={index} {...item} />"),
    }))
    expect((html.match(/data-preview-component="true"/g) ?? [])).toHaveLength(2)
    expect(html).toContain("Первый")
    expect(html).toContain("Второй")
  })

  it("предпочитает mockProps и игнорирует остальные mock-экспорты уровня", async () => {
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
      code: expect.stringContaining("const explicit = mockModule.mockProps ?? mockModule.mock"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.not.stringContaining("Object.entries(mockModule)"),
    }))
    expect((html.match(/data-preview-component="true"/g) ?? [])).toHaveLength(1)
    expect(html).toContain("Одиночный")
    expect(html).not.toContain("Второй объект")
    expect(html).not.toContain(">Первый<")
    expect(html).not.toContain(">Второй<")
  })

  it("возвращает пустые props, если у level-5 нет ни mockProps, ни object mock", async () => {
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
      code: expect.stringContaining("return {}"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.not.stringContaining("Object.entries(mockModule)"),
    }))
    expect((html.match(/data-preview-component="true"/g) ?? [])).toHaveLength(1)
    expect(html).toContain("empty")
    expect(html).not.toContain("Первый")
    expect(html).not.toContain("Второй")
    expect(html).not.toContain("Третий")
  })
})
