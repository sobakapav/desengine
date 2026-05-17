// @openSpec capability: help-content
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает каталог справки"
// @openSpec  - "Система выбирает заголовок ссылки"
// @openSpec  - "Markdown-файл не содержит H1"
// @openSpec  - "Каталог сортирует страницы"
// @openSpec  - "Пользователь открывает существующую help-страницу"
// @openSpec  - "Пользователь открывает отсутствующую help-страницу"
// @openSpec  - "Пользователь открывает help-страницу с небезопасным ID"
// @openSpec  - "Markdown ссылается на картинку help"
// @openSpec  - "Пользователь запрашивает отсутствующую help-картинку"
// @openSpec  - "Пользователь открывает Mermaid-страницу help"
// @openSpec  - "Пользователь открывает отсутствующую Mermaid-страницу help"
// @openSpec  - "Пользователь попадает на страницу ошибки help"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  isSafeAssetId,
  isSafeHelpId,
  listHelpPages,
  readHelpImageAsset,
  readHelpMarkdownPage,
  readHelpMermaidSource,
} from "@/lib/help/content"
import {
  createHelpImageUrl,
  createHelpMermaidUrl,
  createHelpPageUrl,
  getHelpErrorUrl,
} from "@/lib/help/navigation"

function createHelpFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-help-"))
  const helpRoot = path.join(root, "help")
  const imagesRoot = path.join(helpRoot, "images")
  const mermaidRoot = path.join(helpRoot, "mermaid")

  fs.mkdirSync(imagesRoot, { recursive: true })
  fs.mkdirSync(mermaidRoot, { recursive: true })
  fs.writeFileSync(path.join(helpRoot, "beta.md"), "Без H1\n", "utf8")
  fs.writeFileSync(path.join(helpRoot, "alpha.md"), "# Альфа\n\nТекст.\n", "utf8")
  fs.writeFileSync(path.join(helpRoot, "error.md"), "# Не должна попасть в каталог\n", "utf8")
  fs.writeFileSync(path.join(imagesRoot, "demo.png"), Buffer.from([137, 80, 78, 71]))
  fs.writeFileSync(path.join(mermaidRoot, "flow.mmd"), "graph TD\n  A --> B\n", "utf8")

  return {
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
    helpRoot,
    imagesRoot,
    mermaidRoot,
  }
}

describe("help content", () => {
  it("строит каталог из Markdown-файлов, берёт H1 и fallback по имени файла", async () => {
    const fixture = createHelpFixture()

    try {
      const pages = await listHelpPages(fixture.helpRoot)

      expect(pages).toEqual([
        {
          href: "/help/alpha",
          id: "alpha",
          title: "Альфа",
        },
        {
          href: "/help/beta",
          id: "beta",
          title: "beta",
        },
      ])
    } finally {
      fixture.cleanup()
    }
  })

  it("читает Markdown-страницу только по безопасному helpId", async () => {
    const fixture = createHelpFixture()

    try {
      await expect(readHelpMarkdownPage("alpha", fixture.helpRoot)).resolves.toMatchObject({
        content: "# Альфа\n\nТекст.\n",
        href: "/help/alpha",
        id: "alpha",
        title: "Альфа",
      })
      await expect(readHelpMarkdownPage("missing", fixture.helpRoot)).resolves.toBeNull()
      await expect(readHelpMarkdownPage("../alpha", fixture.helpRoot)).resolves.toBeNull()
      expect(isSafeHelpId("error")).toBe(false)
    } finally {
      fixture.cleanup()
    }
  })

  it("читает help-картинки и Mermaid-файлы только внутри их каталогов", async () => {
    const fixture = createHelpFixture()

    try {
      await expect(readHelpImageAsset("demo.png", fixture.imagesRoot)).resolves.toMatchObject({
        contentType: "image/png",
      })
      await expect(readHelpImageAsset("missing.png", fixture.imagesRoot)).resolves.toBeNull()
      await expect(readHelpImageAsset("../demo.png", fixture.imagesRoot)).resolves.toBeNull()
      await expect(readHelpMermaidSource("flow", fixture.mermaidRoot)).resolves.toMatchObject({
        content: "graph TD\n  A --> B\n",
        href: "/help/mermaid/flow",
        id: "flow",
      })
      await expect(readHelpMermaidSource("flow.mmd", fixture.mermaidRoot)).resolves.toMatchObject({
        id: "flow",
      })
      await expect(readHelpMermaidSource("missing", fixture.mermaidRoot)).resolves.toBeNull()
      await expect(readHelpMermaidSource("../flow", fixture.mermaidRoot)).resolves.toBeNull()
      expect(isSafeAssetId("demo.png")).toBe(true)
      expect(isSafeAssetId("..demo.png")).toBe(false)
    } finally {
      fixture.cleanup()
    }
  })

  it("формирует канонические help URL", () => {
    expect(createHelpPageUrl("start")).toBe("/help/start")
    expect(getHelpErrorUrl()).toBe("/help/error")
    expect(createHelpImageUrl("demo.png")).toBe("/help/images/demo.png")
    expect(createHelpMermaidUrl("flow")).toBe("/help/mermaid/flow")
  })

  it("страница ошибки help объясняет проблему и ведёт обратно в справку", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "app/help/error/page.tsx"), "utf8")

    expect(source).toContain("Страница справки недоступна")
    expect(source).toContain("Вернуться к справке")
    expect(source).toContain("getHelpRootUrl")
  })
})
