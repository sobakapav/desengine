import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { renderPromptTemplateFromRoot } from "@/lib/prompt/render/server"

describe("prompt templates (nunjucks)", () => {
  it("рендерит plaintext-шаблон без изменений", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "desengine-prompts-"))
    await writeFile(path.join(root, "plain.njk"), "Привет!\nСтрока 2.\n", "utf-8")

    const out = await renderPromptTemplateFromRoot(root, "plain.njk", {}, { required: true })
    expect(out).toBe("Привет!\nСтрока 2.\n")
  })

  it("поддерживает include", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "desengine-prompts-"))
    await mkdir(path.join(root, "partials"))
    await writeFile(path.join(root, "partials", "a.njk"), "A", "utf-8")
    await writeFile(path.join(root, "main.njk"), "X{% include \"partials/a.njk\" %}Y", "utf-8")

    const out = await renderPromptTemplateFromRoot(root, "main.njk", {}, { required: true })
    expect(out).toBe("XAY")
  })

  it("поддерживает extends/blocks", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "desengine-prompts-"))
    await writeFile(path.join(root, "base.njk"), "BASE:{% block body %}{% endblock %}", "utf-8")
    await writeFile(
      path.join(root, "child.njk"),
      "{% extends \"base.njk\" %}{% block body %}OK{% endblock %}",
      "utf-8",
    )

    const out = await renderPromptTemplateFromRoot(root, "child.njk", {}, { required: true })
    expect(out).toBe("BASE:OK")
  })
})
