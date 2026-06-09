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

function buildLevelSandpackDirCandidates(rootDir: string, levelId: string) {
  return [
    buildLevelSandpackDir(rootDir, levelId),
    path.join(rootDir, "levels", levelId, "sandpack"),
  ]
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

/**
 * @example
 * ```ts
 * const template = await readLevelSandpackTemplate("level-1", { rootDir: process.cwd() })
 * ```
 */
export async function readLevelSandpackTemplate(
  levelId: string,
  options: { rootDir?: string } = {},
): Promise<SandpackLevelTemplate> {
  const rootDir = options.rootDir ?? process.cwd()
  let previewCss: string | null = null

  for (const sandpackDir of buildLevelSandpackDirCandidates(rootDir, levelId)) {
    const appPath = path.join(sandpackDir, "App.tsx")
    const previewCssPath = path.join(sandpackDir, "preview.css")
    const appTsx = await readTextIfExists(appPath)
    const localPreviewCss = await readTextIfExists(previewCssPath)
    previewCss = previewCss ?? localPreviewCss

    if (appTsx !== null) {
      return {
        appTsx,
        previewCss: localPreviewCss,
        source: "level",
      }
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
