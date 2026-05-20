import "server-only"

import { access, readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { appConfig } from "@/lib/system/config/server"
import localConfig from "@/lib/system/config/local.cjs"
import {
  resolveOnboardingSyncState,
  type OnboardingSourceMarker,
} from "@/lib/onboarding/status"
import {
  createConfirmedOnboardingStatus,
  createIncompleteOnboardingStatus,
  createMissingMarkerStatus,
  createMissingOnboardingStatus,
  createMissingRepoStatus,
  createRepoMismatchStatus,
  createUnconfirmedMarkerStatus,
  type OnboardingLayoutStatus,
  type OnboardingSyncStatus,
} from "@/lib/onboarding/sync-status-model"

const ONBOARDING_SOURCE_MARKER_FILE = ".desengine-onboarding-source.json"

const legacyOnboardingRoots = [
  "levels",
  "tasks",
  path.join("prompts", "didactic"),
]

async function pathExists(targetPath: string) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

export function getConfiguredOnboardingRepoUrl() {
  localConfig.loadLocalConfig()
  return process.env.ONBOARDING_REPO_URL?.trim() ?? ""
}

function getOnboardingSourceMarkerPath(root = appConfig.onboardingRoot) {
  return path.join(root, ONBOARDING_SOURCE_MARKER_FILE)
}

/**
 * @example
 * ```ts
 * const layout = await validateOnboardingLayout(appConfig.onboardingRoot)
 * if (!layout.ok) console.log(layout.missingPaths)
 * ```
 */
export async function validateOnboardingLayout(root: string): Promise<OnboardingLayoutStatus> {
  const levelsRoot = path.join(root, "levels")
  const tasksRoot = path.join(root, "tasks")
  const promptsRoot = path.join(root, "prompts")
  const requiredDirs = [
    root,
    levelsRoot,
    tasksRoot,
    promptsRoot,
    path.join(promptsRoot, "levels"),
  ]
  const missingPaths: string[] = []

  for (const dir of requiredDirs) {
    try {
      await readdir(dir)
    } catch {
      missingPaths.push(path.relative(process.cwd(), dir) || dir)
    }
  }

  if (missingPaths.length > 0) {
    return {
      ok: false,
      message: `Не найдены обязательные каталоги onboarding-контента: ${missingPaths.join(", ")}.`,
      missingPaths,
    }
  }

  const [levelEntries, taskEntries] = await Promise.all([
    readdir(levelsRoot, { withFileTypes: true }),
    readdir(tasksRoot, { withFileTypes: true }),
  ])

  if (!levelEntries.some((entry) => entry.isDirectory())) {
    return {
      ok: false,
      message: "В onboarding-контенте не найдено ни одного каталога уровня.",
      missingPaths: ["onboarding/levels/*"],
    }
  }

  if (!taskEntries.some((entry) => entry.isDirectory())) {
    return {
      ok: false,
      message: "В onboarding-контенте не найдено ни одного каталога задачи.",
      missingPaths: ["onboarding/tasks/*"],
    }
  }

  const requiredFiles = [path.join(promptsRoot, "default.njk")]

  for (const filePath of requiredFiles) {
    if (!(await pathExists(filePath))) {
      const relativeFilePath = path.relative(process.cwd(), filePath) || filePath
      return {
        ok: false,
        message: `Не найден обязательный файл onboarding-контента: ${relativeFilePath}.`,
        missingPaths: [relativeFilePath],
      }
    }
  }

  return { ok: true }
}

export async function readOnboardingSourceMarker(
  root = appConfig.onboardingRoot,
): Promise<OnboardingSourceMarker | null> {
  const markerPath = getOnboardingSourceMarkerPath(root)

  try {
    const raw = await readFile(markerPath, "utf-8")
    const parsed = JSON.parse(raw) as Partial<OnboardingSourceMarker>

    if (
      typeof parsed.repoUrl !== "string" ||
      typeof parsed.syncedAt !== "string" ||
      (parsed.commitHash !== null && typeof parsed.commitHash !== "string")
    ) {
      return null
    }

    return {
      repoUrl: parsed.repoUrl,
      syncedAt: parsed.syncedAt,
      commitHash: parsed.commitHash ?? null,
    }
  } catch {
    return null
  }
}

/**
 * @example
 * ```ts
 * await writeOnboardingSourceMarker(root, { repoUrl, syncedAt: new Date().toISOString(), commitHash: null })
 * ```
 */
export async function writeOnboardingSourceMarker(
  root: string,
  marker: OnboardingSourceMarker,
) {
  const markerPath = getOnboardingSourceMarkerPath(root)
  await writeFile(markerPath, `${JSON.stringify(marker, null, 2)}\n`, "utf-8")
}

export async function getLegacyOnboardingPaths() {
  const existing: string[] = []

  for (const relativePath of legacyOnboardingRoots) {
    const absolutePath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath)

    if (await pathExists(absolutePath)) {
      existing.push(relativePath)
    }
  }

  return existing
}

/**
 * @example
 * ```ts
 * const status = await getOnboardingSyncStatus()
 * status.tone
 * ```
 */
export async function getOnboardingSyncStatus(): Promise<OnboardingSyncStatus> {
  const configuredRepoUrl = getConfiguredOnboardingRepoUrl()
  const markerPath = getOnboardingSourceMarkerPath()
  const legacyPaths = await getLegacyOnboardingPaths()
  const context = { configuredRepoUrl, markerPath, legacyPaths }

  if (!(await pathExists(appConfig.onboardingRoot))) {
    return createMissingOnboardingStatus(
      context,
      path.relative(process.cwd(), appConfig.onboardingRoot) || appConfig.onboardingRoot,
    )
  }

  const layoutStatus = await validateOnboardingLayout(appConfig.onboardingRoot)
  if (!layoutStatus.ok) {
    return createIncompleteOnboardingStatus(context, layoutStatus)
  }

  const marker = await readOnboardingSourceMarker()
  const state = resolveOnboardingSyncState({
    configuredRepoUrl,
    marker,
    layoutOk: true,
    onboardingExists: true,
  })

  if (state === "unconfirmed" && !marker) {
    return createMissingMarkerStatus(context)
  }

  if (state === "unconfirmed" && marker && !configuredRepoUrl) {
    return createMissingRepoStatus(context, marker)
  }

  if (state === "unconfirmed" && marker && marker.repoUrl !== configuredRepoUrl) {
    return createRepoMismatchStatus(context, marker)
  }

  const confirmedMarker = marker
  if (!confirmedMarker) {
    return createUnconfirmedMarkerStatus(context)
  }

  return createConfirmedOnboardingStatus(context, state, confirmedMarker)
}

export type {
  OnboardingLayoutStatus,
  OnboardingSyncStatus,
}

// TODO(owner:team-desengine, targetStage:6.5): удалить marker export, если он не понадобится onboarding diagnostics.
// export { ONBOARDING_SOURCE_MARKER_FILE }
