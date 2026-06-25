// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Лаборатория сохраняет локальные project settings при rehydration"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Sandpack preview использует project.uiKitId"

import { expect, test, type Page } from "playwright/test"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { ACCESS_COOKIE_NAME, createAccessSessionValue } from "../../lib/auth/control"
import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
} from "../../lib/project/storage"
import { resolveFixtureAccessSalt } from "../helpers/fixture-access"
import { snapshotUserState, type UserStateSnapshotEntry } from "./fixtures/smoke-fixture"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = resolveFixtureAccessSalt()

function buildProjectStorageValue(taskId: string, overrides: {
  uiKitId: "shadcn" | "none" | "ant"
}) {
  const now = "2026-05-28T00:00:00.000Z"

  return JSON.stringify({
    id: `task-${taskId}`,
    title: `Проект ${taskId}`,
    createdAt: now,
    updatedAt: now,
    settings: overrides,
  })
}

async function readStoredProjectSettings(page: Page, taskId: string) {
  return page.evaluate(({ activeProjectIdKey, registryKey, taskId: nextTaskId }) => {
    const activeProjectId = window.localStorage.getItem(activeProjectIdKey)
    const registryRaw = window.localStorage.getItem(registryKey)
    const registry = registryRaw ? JSON.parse(registryRaw) as Array<{
      id: string
      settings?: {
        uiKitId?: string
              }
    }> : []

    const projectId = activeProjectId ?? `task-${nextTaskId}`
    const project = registry.find((item) => item.id === projectId) ?? null

    return {
      activeProjectId,
      settings: project?.settings ?? null,
    }
  }, {
    activeProjectIdKey: "desengine:active-project-id",
    registryKey: "desengine:project-workspaces",
    taskId,
  })
}

async function seedProjectStorageBeforeNavigation(page: Page, taskId: string, overrides: {
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

function buildFixturePromptHistory(currentLevel: number) {
  return Array.from({ length: Math.max(currentLevel - 1, 0) }, (_, index) => {
    const levelNumber = index + 1
    return {
      text: `Fixture prompt level ${levelNumber}`,
      createdAt: `2026-05-28T09:0${levelNumber}:00.000Z`,
      levelNumber,
    }
  })
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
    updatedAt: "2026-05-28T09:06:00.000Z",
    levels: {
      "1": {
        status: "in_progress",
        isPassed: false,
        promptsUsed: 0,
        initializedAt: "2026-05-28T09:00:00.000Z",
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
      "2": {
        status: "available",
        isPassed: false,
        promptsUsed: 0,
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
      "3": {
        status: "available",
        isPassed: false,
        promptsUsed: 0,
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
    },
  }

  writeJson(progressPath, progress)
  fs.rmSync(taskRoot, { recursive: true, force: true })
  fs.mkdirSync(taskRoot, { recursive: true })
  fs.writeFileSync(path.join(taskRoot, "Component.tsx"), componentSource, "utf-8")
  writeJson(path.join(taskRoot, "prompt-history.json"), buildFixturePromptHistory(1))
  fs.rmSync(checkResultPath, { force: true })
}

test.describe("project UI kit switching", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-ui-kit-switching-"))
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

  test("подтверждает sandpack payload для сохранённых project uiKit settings", async ({ baseURL, context, page }) => {
    const accessCookieValue = await createAccessSessionValue("e2e-ui-kit@example.test", fixtureAccessSalt)
    const labUrl = "/lab/oncor-row"

    prepareStartedTaskFixture(repoRoot, "oncor-row", `export default function Component() {
  return <div data-testid="ui-kit-switching-preview">UI kit switching fixture</div>;
}
`)
    await seedProjectStorageBeforeNavigation(page, "oncor-row", { uiKitId: "shadcn" })

    await context.addCookies([{
      name: ACCESS_COOKIE_NAME,
      value: accessCookieValue,
      url: baseURL ?? "http://127.0.0.1:3410",
      httpOnly: true,
      sameSite: "Lax",
    }])

    const cases = [
      { uiKitId: "shadcn" as const as const },
      { uiKitId: "none" as const as const },
      { uiKitId: "ant" as const as const },
    ]

    await page.close()

    for (const testCase of cases) {
      const currentPage = await context.newPage()
      await seedProjectStorageBeforeNavigation(currentPage, "oncor-row", testCase)

      const payloadRequest = currentPage.waitForRequest((request) => (
        request.url().includes("/api/tasks/oncor-row/sandpack")
      ))

      await currentPage.goto(labUrl)

      const payloadUrl = (await payloadRequest).url()
      expect(payloadUrl).toContain(`uiKitId=${testCase.uiKitId}`)
      expect(currentPage.url()).toMatch(/\/lab\/oncor-row$/)
      await expect.poll(() => readStoredProjectSettings(currentPage, "oncor-row")).toMatchObject({
        activeProjectId: "task-oncor-row",
        settings: {
          uiKitId: testCase.uiKitId,
        },
      })

      await currentPage.close()
    }
  })
})
