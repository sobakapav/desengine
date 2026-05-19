import "server-only"

import { access, readFile } from "node:fs/promises"
import path from "node:path"

import { appConfig } from "@/lib/system/config/server"

import { renderPromptTemplateFromRoot } from "./render/server"
import type { PromptKind, PromptName, PromptRenderContext } from "./types"

async function pathExists(targetPath: string) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

async function pickPromptTemplatePath(root: string, relativePathWithoutExt: string) {
  const njkPath = `${relativePathWithoutExt}.njk`
  const mdPath = `${relativePathWithoutExt}.md`

  if (await pathExists(path.join(root, njkPath))) return njkPath
  if (await pathExists(path.join(root, mdPath))) return mdPath

  return njkPath
}

export async function readPrompt(kind: PromptKind, name: PromptName) {
  return renderPrompt(kind, `${name}`, {})
}

export async function renderPrompt(
  kind: PromptKind,
  name: string,
  context: PromptRenderContext,
) {
  const root = kind === "production" ? appConfig.promptsRoot : appConfig.onboardingPromptsRoot
  const templatePath = await pickPromptTemplatePath(root, name)
  const isMd = templatePath.endsWith(".md")

  if (isMd) {
    return readFile(path.join(root, templatePath), "utf-8")
  }

  return renderPromptTemplateFromRoot(root, templatePath, context, {
    required: true,
    onErrorFallbackToRaw: true,
  })
}

export async function readLevelIteratePrompt(levelId: string) {
  const root = appConfig.onboardingPromptsRoot
  const templatePath = await pickPromptTemplatePath(root, path.join("levels", levelId, "iterate"))

  try {
    if (templatePath.endsWith(".md")) {
      return await readFile(path.join(root, templatePath), "utf-8")
    }
    return await renderPromptTemplateFromRoot(root, templatePath, {}, { onErrorFallbackToRaw: true })
  } catch {
    return ""
  }
}

export async function readLevelStartPrompt(levelId: string) {
  const root = appConfig.onboardingPromptsRoot
  const templatePath = await pickPromptTemplatePath(root, path.join("levels", levelId, "start"))
  const templateExists = await pathExists(path.join(root, templatePath))

  if (!templateExists) {
    throw new Error(`Стартовый промпт уровня не найден: ${levelId}`)
  }

  if (templatePath.endsWith(".md")) {
    return readFile(path.join(root, templatePath), "utf-8")
  }

  try {
    return await renderPromptTemplateFromRoot(root, templatePath, {}, {
      required: true,
      onErrorFallbackToRaw: true,
    })
  } catch (error) {
    throw new Error(
      `Не удалось отрендерить стартовый промпт уровня: ${levelId}. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function readLevelCheckPrompt(levelId: string) {
  const root = appConfig.onboardingPromptsRoot
  const templatePath = await pickPromptTemplatePath(root, path.join("levels", levelId, "check"))

  try {
    if (templatePath.endsWith(".md")) {
      return await readFile(path.join(root, templatePath), "utf-8")
    }
    return await renderPromptTemplateFromRoot(root, templatePath, {}, { onErrorFallbackToRaw: true })
  } catch {
    return ""
  }
}

export async function readLevelCommonExplanation(levelId: string, fallbackText?: string) {
  const filePath = path.join(appConfig.levelsCatalogRoot, levelId, "overview.md")

  try {
    return await readFile(filePath, "utf-8")
  } catch {
    if (fallbackText) {
      return fallbackText
    }

    throw new Error(`Общее пояснение уровня не найдено: ${levelId}`)
  }
}
