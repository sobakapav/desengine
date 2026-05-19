import "server-only"

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { appConfigSource } from "@/lib/system/config/app"
import { AppConfigSchema, type AppConfig } from "@/lib/system/schema"

const parsed = AppConfigSchema.parse(appConfigSource)

function tryResolveRepoRootFromCwd() {
  // В Next.js сборке/пререндерах `import.meta.url` может указывать на файл внутри `.next/`,
  // что ломает относительный `../../..` и приводит к неправильным путям project data.
  // Поэтому сначала пытаемся найти корень репозитория по `process.cwd()` и `package.json`.
  let currentDir = process.cwd()

  for (let i = 0; i < 10; i += 1) {
    const packageJsonPath = path.join(currentDir, "package.json")

    if (fs.existsSync(packageJsonPath)) {
      try {
        const raw = fs.readFileSync(packageJsonPath, "utf8")
        const parsedPackage = JSON.parse(raw) as { name?: string }

        if (parsedPackage.name === "desengine") {
          return currentDir
        }
      } catch {
        // ignore
      }
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) break
    currentDir = parentDir
  }

  return null
}

const repoRoot =
  tryResolveRepoRootFromCwd() ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")

// Нормализация путей для project data и user state.
const appConfig: AppConfig = {
  ...parsed,
  onboardingRoot: path.resolve(repoRoot, parsed.onboardingRoot),
  levelsCatalogRoot: path.resolve(repoRoot, parsed.levelsCatalogRoot),
  taskCatalogRoot: path.resolve(repoRoot, parsed.taskCatalogRoot),
  onboardingPromptsRoot: path.resolve(repoRoot, parsed.onboardingPromptsRoot),
  promptsRoot: path.resolve(repoRoot, parsed.promptsRoot),
  userRoot: path.resolve(repoRoot, parsed.userRoot),
  userProgressFile: path.resolve(repoRoot, parsed.userProgressFile),
}

export { appConfig }
