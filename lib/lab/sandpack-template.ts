import { readFile } from "node:fs/promises"
import path from "node:path"

import { fallbackAppTsx } from "@/lib/lab/sandpack-template-fallback"

export type LevelTemplateRuntime = {
  levelId: string
  levelNumber: number
  labId: string
}

export type SandpackLevelTemplate = {
  appTsx: string
  previewCss: string | null
  source: "level" | "fallback"
}

function buildLevelSandpackDir(rootDir: string, levelId: string) {
  return path.join(rootDir, "onboarding", "levels", levelId, "sandpack")
}

async function readTextIfExists(filePath: string) {
  try {
    return await readFile(filePath, "utf-8")
  } catch (error) {
    if (
      typeof error === "object"
      && error !== null
      && "code" in error
      && error.code === "ENOENT"
    ) {
      return null
    }

    throw error
  }
}

export async function readLevelSandpackTemplate(
  levelId: string,
  options: { rootDir?: string } = {},
): Promise<SandpackLevelTemplate> {
  const rootDir = options.rootDir ?? process.cwd()
  const sandpackDir = buildLevelSandpackDir(rootDir, levelId)
  const appPath = path.join(sandpackDir, "App.tsx")
  const previewCssPath = path.join(sandpackDir, "preview.css")

  const appTsx = await readTextIfExists(appPath)
  const previewCss = await readTextIfExists(previewCssPath)

  if (appTsx !== null) {
    return {
      appTsx,
      previewCss,
      source: "level",
    }
  }

  return {
    appTsx: fallbackAppTsx,
    previewCss,
    source: "fallback",
  }
}

export function buildLevelTemplateRuntimeSource(runtime: LevelTemplateRuntime) {
  const json = JSON.stringify(runtime, null, 2)

  return `export const levelRuntime = ${json} as const;\n`
}

