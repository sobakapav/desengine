import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFile } from "node:child_process"
import { mkdtemp, rename, rm, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { pathToFileURL } from "node:url"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const require = createRequire(import.meta.url)
const { loadLocalConfig, readLocalConfig, getLocalConfigPath } = require("../lib/system/config/local.cjs")

const rootDir = process.cwd()
const envPath = getLocalConfigPath(rootDir)
const configPath = path.join(rootDir, "desengine.config.json")
const markerFileName = ".desengine-onboarding-source.json"
const canonicalDefaultPromptFileName = "default.njk"

function readAppConfig() {
  const parsed = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  return {
    onboardingRoot: path.resolve(rootDir, parsed.onboardingRoot ?? "onboarding"),
  }
}

async function pathExists(targetPath) {
  try {
    await fs.promises.access(targetPath)
    return true
  } catch {
    return false
  }
}

function isCrossDeviceError(error) {
  return error instanceof Error && "code" in error && error.code === "EXDEV"
}

async function replaceDirectory(sourcePath, targetPath) {
  if (await pathExists(targetPath)) {
    await rm(targetPath, { recursive: true, force: true })
  }

  try {
    await rename(sourcePath, targetPath)
    return
  } catch (error) {
    if (!isCrossDeviceError(error)) {
      throw error
    }
  }

  try {
    await fs.promises.cp(sourcePath, targetPath, { recursive: true, force: true })
  } catch (error) {
    await rm(targetPath, { recursive: true, force: true })
    throw error
  }

  await rm(sourcePath, { recursive: true, force: true })
}

export async function validateOnboardingLayout(root) {
  const levelsRoot = path.join(root, "levels")
  const tasksRoot = path.join(root, "tasks")
  const promptsRoot = path.join(root, "prompts")
  const defaultPromptPath = path.join(promptsRoot, canonicalDefaultPromptFileName)
  const requiredDirs = [root, levelsRoot, tasksRoot, promptsRoot, path.join(promptsRoot, "levels")]

  for (const dir of requiredDirs) {
    try {
      await fs.promises.readdir(dir)
    } catch {
      throw new Error(`Не найден обязательный каталог onboarding-контента: ${path.relative(rootDir, dir)}.`)
    }
  }

  const [levelEntries, taskEntries] = await Promise.all([
    fs.promises.readdir(levelsRoot, { withFileTypes: true }),
    fs.promises.readdir(tasksRoot, { withFileTypes: true }),
  ])

  if (!levelEntries.some((entry) => entry.isDirectory())) {
    throw new Error("В onboarding-контенте не найдено ни одного каталога уровня.")
  }

  if (!taskEntries.some((entry) => entry.isDirectory())) {
    throw new Error("В onboarding-контенте не найдено ни одного каталога задачи.")
  }

  if (!(await pathExists(defaultPromptPath))) {
    throw new Error(`Не найден обязательный файл onboarding-контента: ${path.relative(rootDir, defaultPromptPath)}.`)
  }
}

async function runGit(args, cwd) {
  try {
    return await execFileAsync("git", args, {
      cwd,
      env: process.env,
      maxBuffer: 20 * 1024 * 1024,
    })
  } catch (error) {
    const stderr = String(error?.stderr || "").trim()
    const stdout = String(error?.stdout || "").trim()
    const detail = stderr || stdout || error?.message || "Неизвестная ошибка git"
    throw new Error(`Не удалось выполнить git ${args.join(" ")}: ${detail}`)
  }
}

export async function main() {
  loadLocalConfig({ forceReload: true })
  const fileEnv = readLocalConfig(envPath)

  for (const [key, value] of Object.entries(fileEnv)) {
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }

  const repoUrl = process.env.ONBOARDING_REPO_URL?.trim() ?? ""
  if (!repoUrl) {
    throw new Error("Не задан `ONBOARDING_REPO_URL` в desengine.config.txt.")
  }

  const appConfig = readAppConfig()
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "desengine-onboarding-repair-"))
  const checkoutDir = path.join(tempRoot, "repo")

  try {
    await runGit(["clone", "--depth", "1", repoUrl, checkoutDir])
    const revision = await runGit(["rev-parse", "HEAD"], checkoutDir)
    const commitHash = revision.stdout.trim() || null

    await validateOnboardingLayout(checkoutDir)
    await writeFile(
      path.join(checkoutDir, markerFileName),
      `${JSON.stringify({ repoUrl, syncedAt: new Date().toISOString(), commitHash }, null, 2)}\n`,
      "utf-8",
    )

    await replaceDirectory(checkoutDir, appConfig.onboardingRoot)

    process.stdout.write(
      `${JSON.stringify({ ok: true, repoUrl, commitHash }, null, 2)}\n`,
    )
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

const entrypointArg = process.argv[1]
const isCliEntrypoint = entrypointArg ? import.meta.url === pathToFileURL(entrypointArg).href : false

if (isCliEntrypoint) {
  await main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Не удалось синхронизировать onboarding."}\n`)
    process.exitCode = 1
  })
}
