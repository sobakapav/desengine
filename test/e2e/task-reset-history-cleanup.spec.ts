// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь сбрасывает задачу"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь сбрасывает задачу через service boundary"
// @openSpec capability: user-progress
// @openSpec scenarios:
// @openSpec  - "Пользователь сбрасывает задачу"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { expect, test } from "playwright/test"

import { ACCESS_COOKIE_NAME, createAccessSessionValue } from "../../lib/auth/control"
import { resolveFixtureAccessSalt } from "../helpers/fixture-access"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = resolveFixtureAccessSalt()
const taskId = "dipole-button"

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

function prepareTaskResetFixture(rootDir: string) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
  const checkResultPath = path.join(userRoot, "check-results", `${taskId}.json`)

  const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as {
    tasks: Record<string, unknown>
  }

  progress.tasks[taskId] = {
    currentLevel: 2,
    updatedAt: "2026-05-28T09:06:00.000Z",
    levels: {
      "1": {
        status: "completed",
        isPassed: true,
        promptsUsed: 1,
        initializedAt: "2026-05-28T09:00:00.000Z",
        completedAt: "2026-05-28T09:01:00.000Z",
        checkAttemptsUsed: 1,
        checkingState: "idle",
      },
      "2": {
        status: "in_progress",
        isPassed: false,
        promptsUsed: 2,
        initializedAt: "2026-05-28T09:02:00.000Z",
        checkAttemptsUsed: 1,
        checkingState: "awaiting_retry",
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
  fs.mkdirSync(path.join(taskRoot, ".level-reset"), { recursive: true })
  fs.writeFileSync(
    path.join(taskRoot, "Component.tsx"),
    "export default function Component() { return <button>broken level 2</button> }",
    "utf-8",
  )
  writeJson(path.join(taskRoot, "prompt-history.json"), [
    {
      text: "Уточнение уровня 1",
      createdAt: "2026-05-28T09:00:30.000Z",
      levelNumber: 1,
    },
    {
      text: "Уточнение уровня 2",
      createdAt: "2026-05-28T09:03:00.000Z",
      levelNumber: 2,
    },
  ])
  writeJson(checkResultPath, {
    taskId,
    levelId: "level-2",
    levelNumber: 2,
    levelTitle: "Уровень 2",
    attemptNumber: 1,
    maxCheckAttempts: 2,
    passed: false,
    message: "Нужна ещё одна правка",
    kind: "failed",
    createdAt: "2026-05-28T09:04:00.000Z",
  })
}

test.describe("task reset history cleanup", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-task-reset-"))
  const userBackup = path.join(backupRoot, "user")

  test.beforeAll(() => {
    copyDir(userRoot, userBackup)
  })

  test.afterAll(() => {
    restoreDir(userBackup, userRoot)
    fs.rmSync(backupRoot, { recursive: true, force: true })
  })

  test("сбрасывает задачу целиком и очищает task-scope", async ({ baseURL, context, page }) => {
    prepareTaskResetFixture(repoRoot)

    const accessCookieValue = await createAccessSessionValue("e2e-task-reset@example.test", fixtureAccessSalt)
    await context.addCookies([{
      name: ACCESS_COOKIE_NAME,
      value: accessCookieValue,
      url: baseURL ?? "http://127.0.0.1:3410",
      httpOnly: true,
      sameSite: "Lax",
    }])

    await page.goto(`/lab/${taskId}`)
    await expect(page.getByText("Рабочий стол")).toBeVisible()
    const contextStatus = page.getByTestId("workbench-context-status")
    await expect(contextStatus).toContainText("2 из 5")
    await expect(contextStatus).toContainText("2 / 3")

    const resetTaskButton = page.locator("button").filter({ hasText: "Сбросить задачу" }).first()
    await expect(resetTaskButton).toBeVisible({ timeout: 20_000 })

    await resetTaskButton.click()
    const resetResponsePromise = page.waitForResponse((response) => (
      response.request().method() === "POST"
      && response.url().includes(`/api/tasks/${taskId}/reset`)
    ))
    await page.getByRole("button", { name: "Подтвердить сброс задачи" }).click()
    await expect(page.getByRole("button", { name: "Сбрасываем задачу…" })).toBeVisible()

    const resetResponse = await resetResponsePromise
    expect(resetResponse.status(), await resetResponse.text()).toBe(200)

    await expect(page.getByRole("heading", { name: "Начать уровень 1 в задаче dipole-button" })).toBeVisible()
    await expect(contextStatus).toContainText("1 из 5")
    await expect(contextStatus).toContainText("0 / 3")

    const progress = JSON.parse(fs.readFileSync(path.join(userRoot, "user-progress.json"), "utf-8")) as {
      tasks: Record<string, unknown>
    }

    expect(progress.tasks[taskId]).toBeUndefined()
    expect(fs.existsSync(path.join(userRoot, "tasks", taskId, "prompt-history.json"))).toBe(false)
    expect(fs.existsSync(path.join(userRoot, "check-results", `${taskId}.json`))).toBe(false)
    expect(fs.existsSync(path.join(userRoot, "tasks", taskId, "Component.tsx"))).toBe(false)
  })
})
