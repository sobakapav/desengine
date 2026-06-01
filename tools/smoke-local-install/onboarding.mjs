import fs from "node:fs"
import path from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { createCheck } from "./checks.mjs"

const execFileAsync = promisify(execFile)
const markerFileName = ".desengine-onboarding-source.json"
const canonicalDefaultPromptFileName = "default.njk"

async function pathExists(targetPath) {
  try {
    await fs.promises.access(targetPath)
    return true
  } catch {
    return false
  }
}

function readAppConfig(rootDir) {
  const parsed = JSON.parse(fs.readFileSync(path.join(rootDir, "desengine.config.json"), "utf-8"))
  return {
    onboardingRoot: path.resolve(rootDir, parsed.onboardingRoot ?? "onboarding"),
  }
}

async function validateRequiredDirs(rootDir, root, promptsRoot) {
  const requiredDirs = [root, path.join(root, "levels"), path.join(root, "tasks"), promptsRoot, path.join(promptsRoot, "levels")]
  const missingPaths = []

  for (const dir of requiredDirs) {
    try {
      await fs.promises.readdir(dir)
    } catch {
      missingPaths.push(path.relative(rootDir, dir) || dir)
    }
  }

  return missingPaths
}

async function validateOnboardingLayout(rootDir, root) {
  const levelsRoot = path.join(root, "levels")
  const tasksRoot = path.join(root, "tasks")
  const promptsRoot = path.join(root, "prompts")
  const defaultPromptPath = path.join(promptsRoot, canonicalDefaultPromptFileName)
  const missingPaths = await validateRequiredDirs(rootDir, root, promptsRoot)

  if (missingPaths.length > 0) {
    return { ok: false, detail: `Не найдены обязательные каталоги: ${missingPaths.join(", ")}.` }
  }

  const [levelEntries, taskEntries] = await Promise.all([
    fs.promises.readdir(levelsRoot, { withFileTypes: true }),
    fs.promises.readdir(tasksRoot, { withFileTypes: true }),
  ])

  if (!levelEntries.some((entry) => entry.isDirectory())) {
    return { ok: false, detail: "В `/onboarding/levels` не найдено ни одного каталога уровня." }
  }
  if (!taskEntries.some((entry) => entry.isDirectory())) {
    return { ok: false, detail: "В `/onboarding/tasks` не найдено ни одного каталога задачи." }
  }
  if (!(await pathExists(defaultPromptPath))) {
    return { ok: false, detail: `Не найден обязательный файл onboarding-контента: ${path.relative(rootDir, defaultPromptPath)}.` }
  }

  return { ok: true, detail: "Onboarding-layout выглядит полным." }
}

async function inspectMarker(markerPath, repoUrl) {
  try {
    const marker = JSON.parse(await fs.promises.readFile(markerPath, "utf-8"))

    if (typeof marker.repoUrl !== "string") {
      return { state: "unconfirmed", detail: "Маркер синхронизации повреждён и не содержит `repoUrl`." }
    }
    if (marker.repoUrl !== repoUrl) {
      return { state: "unconfirmed", detail: `Маркер указывает на ${marker.repoUrl}, а в конфиге задан ${repoUrl}.` }
    }

    return {
      state: "synced",
      detail: marker.commitHash
        ? `Источник подтверждён, последний коммит: ${marker.commitHash}.`
        : "Источник подтверждён маркером синхронизации.",
    }
  } catch {
    return { state: "unconfirmed", detail: "Маркер синхронизации не удалось прочитать." }
  }
}

async function inspectOnboardingState(rootDir, repoUrl) {
  const { onboardingRoot } = readAppConfig(rootDir)

  if (!(await pathExists(onboardingRoot))) {
    return { state: "missing", detail: "Каталог `/onboarding` отсутствует." }
  }

  const layout = await validateOnboardingLayout(rootDir, onboardingRoot)
  if (!layout.ok) {
    return { state: "missing", detail: layout.detail }
  }

  const markerPath = path.join(onboardingRoot, markerFileName)
  if (!(await pathExists(markerPath))) {
    return { state: "unconfirmed", detail: "Маркер синхронизации `/onboarding` не найден." }
  }

  return inspectMarker(markerPath, repoUrl)
}

async function repairOnboarding(rootDir, env, beforeRepair) {
  const repairToolPath = path.join(rootDir, "tools", "repair-onboarding.mjs")
  const { stdout } = await execFileAsync(process.execPath, [repairToolPath], {
    cwd: rootDir,
    env: { ...process.env, ...env },
    maxBuffer: 10 * 1024 * 1024,
  })
  const payload = JSON.parse(stdout)
  const commitText = payload.commitHash ? ` Коммит: ${payload.commitHash}.` : ""

  return createCheck(
    "onboarding-sync",
    true,
    beforeRepair.state === "missing"
      ? "Onboarding загружен из канонического репозитория"
      : "Onboarding пересинхронизирован из канонического репозитория",
    `Источник: ${payload.repoUrl}.${commitText}`,
  )
}

export async function ensureOnboardingReady(rootDir, env) {
  const repoUrl = env.ONBOARDING_REPO_URL?.trim() ?? ""

  if (!repoUrl) {
    return createCheck(
      "onboarding-sync",
      false,
      "Onboarding-репозиторий не настроен",
      "Задайте `ONBOARDING_REPO_URL` в `desengine.config.txt`, иначе установка не сможет подтвердить источник `/onboarding`.",
    )
  }

  const beforeRepair = await inspectOnboardingState(rootDir, repoUrl)
  if (beforeRepair.state === "synced") {
    return createCheck("onboarding-sync", true, "Onboarding уже синхронизирован", beforeRepair.detail)
  }

  try {
    return await repairOnboarding(rootDir, env, beforeRepair)
  } catch (error) {
    const detail = error.stderr?.trim() || error.stdout?.trim() || error.message
    return createCheck("onboarding-sync", false, "Onboarding не удалось синхронизировать", `${beforeRepair.detail} Попытка repair завершилась ошибкой: ${detail}`)
  }
}
