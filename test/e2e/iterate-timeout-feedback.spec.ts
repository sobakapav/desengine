// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Уточнение превысило bounded timeout"
// @openSpec  - "Проверка уровня превысила bounded timeout"
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Iterate-запрос превысил bounded timeout"
// @openSpec  - "Check-запрос превысил bounded timeout"
// @openSpec capability: task-levels
// @openSpec scenarios:
// @openSpec  - "Check route завис без ответа"
// @openSpec  - "Техническая ошибка проверки не расходует лимит"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { expect, test } from "playwright/test"

import { ACCESS_COOKIE_NAME, createAccessSessionValue } from "../../lib/auth/control"
import { resolveFixtureAccessSalt } from "../helpers/fixture-access"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = resolveFixtureAccessSalt()
const taskId = "dipole-button"
const actionTimeoutMs = 150
const delayedResponseMs = 1_000

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

function prepareStartedTaskFixture(rootDir: string) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
  const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as {
    tasks: Record<string, unknown>
  }

  progress.tasks[taskId] = {
    currentLevel: 1,
    updatedAt: "2026-06-01T13:00:00.000Z",
    levels: {
      "1": {
        status: "in_progress",
        isPassed: false,
        promptsUsed: 0,
        initializedAt: "2026-06-01T12:55:00.000Z",
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
    },
  }

  writeJson(progressPath, progress)
  fs.mkdirSync(taskRoot, { recursive: true })
  fs.writeFileSync(
    path.join(taskRoot, "Component.tsx"),
    [
      "export default function Component() {",
      "  return <button>CTA</button>",
      "}",
      "",
    ].join("\n"),
    "utf-8",
  )
  writeJson(path.join(taskRoot, "prompt-history.json"), [])
}

async function delay(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

test.describe("iterate timeout feedback", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-iterate-timeout-"))
  const userBackup = path.join(backupRoot, "user")

  test.beforeAll(() => {
    copyDir(userRoot, userBackup)
  })

  test.afterAll(() => {
    restoreDir(userBackup, userRoot)
    fs.rmSync(backupRoot, { recursive: true, force: true })
  })

  test.beforeEach(async ({ baseURL, context, page }) => {
    prepareStartedTaskFixture(repoRoot)

    const accessCookieValue = await createAccessSessionValue("e2e-iterate-timeout@example.test", fixtureAccessSalt)
    await context.addCookies([{
      name: ACCESS_COOKIE_NAME,
      value: accessCookieValue,
      url: baseURL ?? "http://127.0.0.1:3410",
      httpOnly: true,
      sameSite: "Lax",
    }])

    await page.addInitScript((timeoutMs) => {
      ;(window as Window & typeof globalThis & {
        __DESENGINE_WORKBENCH_ACTION_TIMEOUT_MS__?: number
      }).__DESENGINE_WORKBENCH_ACTION_TIMEOUT_MS__ = timeoutMs
    }, actionTimeoutMs)
  })

  test("iterate выходит из pending по bounded timeout и оставляет prompt retriable", async ({ page }) => {
    let iterateRequests = 0
    await page.route(`**/api/tasks/${taskId}/iterate`, async (route) => {
      iterateRequests += 1
      await delay(delayedResponseMs)
      try {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        })
      } catch {}
    })

    await page.goto(`/lab/${taskId}`)
    await expect(page.getByText("Рабочий стол")).toBeVisible()

    const promptInput = page.getByPlaceholder("Опиши, что нужно уточнить или исправить")
    const runButton = page.getByRole("button", { name: "Запустить →" })
    const timeoutError = page.getByText('Не удалось дождаться ответа на действие "Уточнение". Повторите попытку.')

    await promptInput.fill("Сделай кнопку заметнее")
    await runButton.click()

    await expect(timeoutError).toBeVisible()
    await expect(runButton).toBeEnabled()
    await expect(promptInput).toHaveValue("Сделай кнопку заметнее")

    await runButton.click()
    await expect(timeoutError).toBeVisible()
    expect(iterateRequests).toBe(2)
  })

  test("check выходит из pending по bounded timeout и позволяет повторить проверку", async ({ page }) => {
    let checkRequests = 0
    await page.route(`**/api/tasks/${taskId}/check`, async (route) => {
      checkRequests += 1
      await delay(delayedResponseMs)
      try {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        })
      } catch {}
    })

    await page.goto(`/lab/${taskId}`)
    await expect(page.getByText("Рабочий стол")).toBeVisible()

    const checkButton = page.getByRole("button", { name: "Проверить результат" })
    const timeoutError = page.getByText('Не удалось дождаться ответа на действие "Проверка уровня". Повторите попытку.')

    await checkButton.click()

    await expect(timeoutError).toBeVisible()
    await expect(checkButton).toBeEnabled()
    await expect(page.getByText("Уровень 1")).toBeVisible()

    await checkButton.click()
    await expect(timeoutError).toBeVisible()
    expect(checkRequests).toBe(2)
  })
})
