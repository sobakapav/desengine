// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Preview поднимает runtime-ошибку Sandpack в host UI"
// @openSpec  - "Preview игнорирует stale runtime contract messages"

import { expect, test, type BrowserContext, type Page } from "playwright/test"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { ACCESS_COOKIE_NAME, createAccessSessionValue } from "../../lib/auth/control"
import { resolveFixtureAccessSalt } from "../helpers/fixture-access"
import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
} from "../../lib/project/storage"
import { snapshotUserState, type UserStateSnapshotEntry } from "./fixtures/smoke-fixture"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = resolveFixtureAccessSalt()

function buildProjectStorageValue(taskId: string, overrides: {
  uiKitId: "shadcn" | "none" | "ant"
}) {
  const now = "2026-06-01T00:00:00.000Z"

  return JSON.stringify({
    id: `task-${taskId}`,
    title: `Проект ${taskId}`,
    createdAt: now,
    updatedAt: now,
    settings: overrides,
  })
}

function copyDir(sourcePath: string, targetPath: string) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.cpSync(sourcePath, targetPath, { recursive: true, force: true })
}

function restoreDir(sourcePath: string, targetPath: string) {
  fs.rmSync(targetPath, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.cpSync(sourcePath, targetPath, { recursive: true, force: true })
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf-8")
}

function prepareStartedTaskFixture(rootDir: string, taskId: string, componentSource: string) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
  const checkResultPath = path.join(userRoot, "check-results", `${taskId}.json`)
  const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as {
    tasks: Record<string, {
      currentLevel: number
      updatedAt: string
      levels: Record<string, {
        status: string
        isPassed: boolean
        promptsUsed: number
        initializedAt?: string
        completedAt?: string
        checkAttemptsUsed: number
        checkingState: string
      }>
    }>
  }

  progress.tasks[taskId] = {
    currentLevel: 1,
    updatedAt: "2026-06-01T09:00:00.000Z",
    levels: {
      "1": {
        status: "in_progress",
        isPassed: false,
        promptsUsed: 0,
        initializedAt: "2026-06-01T09:00:00.000Z",
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
    },
  }

  writeJson(progressPath, progress)
  fs.rmSync(taskRoot, { recursive: true, force: true })
  fs.mkdirSync(taskRoot, { recursive: true })
  fs.writeFileSync(path.join(taskRoot, "Component.tsx"), componentSource, "utf-8")
  fs.rmSync(checkResultPath, { force: true })
}

async function authorizeFixtureTask(context: BrowserContext, baseURL: string | undefined) {
  const accessCookieValue = await createAccessSessionValue("e2e-preview@example.test", fixtureAccessSalt)

  await context.addCookies([{
    name: ACCESS_COOKIE_NAME,
    value: accessCookieValue,
    url: baseURL ?? "http://127.0.0.1:3410",
    httpOnly: true,
    sameSite: "Lax",
  }])
}

async function seedProjectStorage(page: Page, taskId: string, overrides: {
  uiKitId: "shadcn" | "none" | "ant"
}) {
  const projectId = `task-${taskId}`
  const storageKey = `desengine:project:${taskId}`
  const storageValue = buildProjectStorageValue(taskId, overrides)
  const registryValue = JSON.stringify([JSON.parse(storageValue)])

  await page.addInitScript(({
    activeProjectIdKey,
    key,
    projectId: nextProjectId,
    registryKey,
    registryValue: nextRegistryValue,
    value,
  }) => {
    window.localStorage.setItem(key, value)
    window.localStorage.setItem(registryKey, nextRegistryValue)
    window.localStorage.setItem(activeProjectIdKey, nextProjectId)
  }, {
    activeProjectIdKey: ACTIVE_PROJECT_ID_STORAGE_KEY,
    key: storageKey,
    projectId,
    registryKey: PROJECT_REGISTRY_STORAGE_KEY,
    registryValue,
    value: storageValue,
  })
}

test.describe("safari task runtime instability", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-safari-runtime-"))
  const userBackup = path.join(backupRoot, "user")
  let initialUserState: UserStateSnapshotEntry[] = []

  test.beforeAll(() => {
    copyDir(userRoot, userBackup)
    initialUserState = snapshotUserState()
  })

  test.beforeEach(() => {
    restoreDir(userBackup, userRoot)
  })

  test.afterAll(() => {
    restoreDir(userBackup, userRoot)
    expect(snapshotUserState().map(({ relativePath, size }) => ({ relativePath, size }))).toEqual(
      initialUserState.map(({ relativePath, size }) => ({ relativePath, size })),
    )
    fs.rmSync(backupRoot, { recursive: true, force: true })
  })

  test("игнорирует анонимный и stale contract message после готовности preview", async ({ baseURL, context, page }) => {
    prepareStartedTaskFixture(repoRoot, "dipole-checkbox", `export default function Component() {
  return <div className="w-[57px] h-[16px] bg-gray-200">Stable preview</div>;
}
`)
    await authorizeFixtureTask(context, baseURL)
    await seedProjectStorage(page, "dipole-checkbox", { uiKitId: "shadcn" })

    await page.goto("/lab/dipole-checkbox")
    await expect(page.locator(".sp-preview-iframe")).toBeVisible({ timeout: 20_000 })
    await expect(page.locator("text=Компонент не удалось отрендерить в preview.")).toBeHidden()

    const previewFrame = page.frameLocator(".sp-preview-iframe")
    await expect(previewFrame.locator("html")).toHaveAttribute("data-desengine-preview-contract", "ready", { timeout: 20_000 })

    await page.evaluate(() => {
      window.postMessage({
        source: "desengine-sandpack-preview",
        type: "contract",
        status: "render-error",
        message: "anonymous-stale-message",
      }, "*")

      window.postMessage({
        source: "desengine-sandpack-preview",
        type: "contract",
        status: "render-error",
        message: "wrong-session-message",
        previewSessionId: "stale-session-id",
      }, "*")
    })

    await page.waitForTimeout(500)
    await expect(page.locator("text=Компонент не удалось отрендерить в preview.")).toBeHidden()
    await expect(page.locator("text=anonymous-stale-message")).toBeHidden()
    await expect(page.locator("text=wrong-session-message")).toBeHidden()
  })
})
