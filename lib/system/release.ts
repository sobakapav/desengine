import "server-only"

import { execFile } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

function tryResolveRepoRootFromCwd() {
  // `npm run start` может запускать Next.js из `.next/standalone`, из-за чего `process.cwd()`
  // не совпадает с корнем репозитория и git-команды начинают выполняться не там.
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

type ReleaseVersion = {
  major: number
  minor: number
  patch: number
  suffix: string
}

type SystemReleaseCondition =
  | "upToDate"
  | "updateAvailable"
  | "development"
  | "unavailable"

type SystemReleaseStatus = {
  branch: string
  canUpdate: boolean
  condition: SystemReleaseCondition
  currentVersion: string | null
  dirty: boolean
  latestVersion: string | null
  message: string
  nearestVersion: string | null
  remoteUrl: string | null
  updateSafety: string
}

type SystemUpdateResult = {
  latestVersion: string
  previousVersion: string | null
}

function normalizeReleaseTag(tag: string) {
  return tag.trim().replace(/^refs\/tags\//, "").replace(/\^\{\}$/, "")
}

function parseReleaseVersion(tag: string): ReleaseVersion | null {
  const normalized = normalizeReleaseTag(tag)
  const match = normalized.match(/^v?(\d+)\.(\d+)\.(\d+)(.*)$/)

  if (!match) {
    return null
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    suffix: match[4] ?? "",
  }
}

function compareReleaseTags(left: string, right: string) {
  const leftVersion = parseReleaseVersion(left)
  const rightVersion = parseReleaseVersion(right)

  if (!leftVersion || !rightVersion) {
    return left.localeCompare(right)
  }

  const fields: Array<keyof Pick<ReleaseVersion, "major" | "minor" | "patch">> = [
    "major",
    "minor",
    "patch",
  ]

  for (const field of fields) {
    if (leftVersion[field] !== rightVersion[field]) {
      return leftVersion[field] - rightVersion[field]
    }
  }

  if (leftVersion.suffix === rightVersion.suffix) {
    return 0
  }

  if (!leftVersion.suffix) {
    return 1
  }

  if (!rightVersion.suffix) {
    return -1
  }

  return leftVersion.suffix.localeCompare(rightVersion.suffix)
}

function selectLatestReleaseTag(tags: string[]) {
  const releaseTags = tags
    .map(normalizeReleaseTag)
    .filter((tag, index, allTags) => parseReleaseVersion(tag) && allTags.indexOf(tag) === index)

  return releaseTags.sort(compareReleaseTags).at(-1) ?? null
}

function getSystemReleaseCondition(params: {
  currentVersion: string | null
  latestVersion: string | null
  nearestVersion: string | null
}): SystemReleaseCondition {
  if (!params.latestVersion) {
    // Если система запущена из точного релизного тега, но онлайн-проверка origin недоступна,
    // это допустимый сценарий: не тревожим пользователя ложным warning.
    if (params.currentVersion) {
      return "upToDate"
    }

    // Если релизный тег не подтверждён, считаем состояние dev-подобным.
    if (params.nearestVersion) {
      return "development"
    }

    return "unavailable"
  }

  const comparableCurrent = params.currentVersion ?? params.nearestVersion

  if (!comparableCurrent) {
    return "development"
  }

  const comparison = compareReleaseTags(comparableCurrent, params.latestVersion)

  if (comparison < 0) {
    return "updateAvailable"
  }

  if (comparison > 0 || !params.currentVersion) {
    return "development"
  }

  return "upToDate"
}

async function runGit(args: string[], options: { timeout?: number } = {}) {
  try {
    return await execFileAsync("git", args, {
      cwd: repoRoot,
      env: process.env,
      maxBuffer: 1024 * 1024 * 20,
      timeout: options.timeout ?? 5000,
    })
  } catch (error) {
    const stderr = error instanceof Error && "stderr" in error ? String(error.stderr || "").trim() : ""
    const stdout = error instanceof Error && "stdout" in error ? String(error.stdout || "").trim() : ""
    const detail = stderr || stdout || (error instanceof Error ? error.message : "Неизвестная ошибка git")
    throw new Error(`Не удалось выполнить git ${args.join(" ")}: ${detail}`)
  }
}

async function tryRunGit(args: string[], options?: { timeout?: number }) {
  try {
    return (await runGit(args, options)).stdout.trim()
  } catch {
    return null
  }
}

function getUpdateSafety(params: {
  condition: SystemReleaseCondition
  dirty: boolean
  currentVersion: string | null
}) {
  if (params.condition !== "updateAvailable") {
    return "Автоматическое обновление сейчас не требуется."
  }

  if (params.dirty) {
    return "Есть локальные изменения, поэтому автоматическое обновление отключено."
  }

  if (!params.currentVersion) {
    return "Система запущена не из точного релизного тега; обновление переключит Git на последний релиз."
  }

  return "Кнопка обновит систему до последнего релизного тега."
}

async function getSystemReleaseStatus(): Promise<SystemReleaseStatus> {
  const isGitRepo = await tryRunGit(["rev-parse", "--is-inside-work-tree"])

  if (isGitRepo !== "true") {
    return {
      branch: "",
      canUpdate: false,
      condition: "unavailable",
      currentVersion: null,
      dirty: false,
      latestVersion: null,
      message: "каталог не выглядит как Git-репозиторий",
      nearestVersion: null,
      remoteUrl: null,
      updateSafety: "Автоматическое обновление доступно только для установки через Git.",
    }
  }

  const [branch, currentVersion, nearestVersion, remoteUrl, statusOutput, remoteTagsOutput] = await Promise.all([
    tryRunGit(["branch", "--show-current"]),
    tryRunGit(["describe", "--tags", "--exact-match", "HEAD", "--match", "v[0-9]*"]),
    tryRunGit(["describe", "--tags", "--abbrev=0", "--match", "v[0-9]*"]),
    tryRunGit(["remote", "get-url", "origin"]),
    tryRunGit(["status", "--porcelain"]),
    tryRunGit(["ls-remote", "--tags", "--refs", "origin"], { timeout: 7000 }),
  ])
  const dirty = Boolean(statusOutput)
  const latestVersion = remoteTagsOutput
    ? selectLatestReleaseTag(remoteTagsOutput.split("\n").map((line) => line.split(/\s+/)[1] ?? ""))
    : null
  const baseCondition = getSystemReleaseCondition({
    currentVersion,
    latestVersion,
    nearestVersion,
  })
  const condition = dirty && baseCondition === "upToDate" ? "development" : baseCondition
  const updateSafety = getUpdateSafety({
    condition,
    currentVersion,
    dirty,
  })

  return {
    branch: branch || "detached HEAD",
    canUpdate: condition === "updateAvailable" && Boolean(latestVersion) && !dirty,
    condition,
    currentVersion,
    dirty,
    latestVersion,
    message: remoteTagsOutput ? "проверка релизов выполнена" : "не удалось получить список тегов с origin",
    nearestVersion,
    remoteUrl,
    updateSafety,
  }
}

async function updateSystemToLatestRelease(): Promise<SystemUpdateResult> {
  const dirty = Boolean(await tryRunGit(["status", "--porcelain"]))

  if (dirty) {
    throw new Error("В рабочем дереве есть локальные изменения. Сохраните их перед обновлением системы.")
  }

  const previousVersion = await tryRunGit(["describe", "--tags", "--exact-match", "HEAD", "--match", "v[0-9]*"])

  await runGit(["fetch", "--tags", "origin"], { timeout: 30_000 })

  const localTags = (await runGit(["tag", "--list"], { timeout: 10_000 })).stdout.split("\n")
  const latestVersion = selectLatestReleaseTag(localTags)

  if (!latestVersion) {
    throw new Error("Не удалось найти релизные теги системы.")
  }

  await runGit(["checkout", latestVersion], { timeout: 30_000 })

  return {
    latestVersion,
    previousVersion,
  }
}

export type {
  SystemReleaseCondition,
  SystemReleaseStatus,
  SystemUpdateResult,
}

export {
  compareReleaseTags,
  getSystemReleaseCondition,
  getSystemReleaseStatus,
  selectLatestReleaseTag,
  updateSystemToLatestRelease,
}
