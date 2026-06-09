// @openSpec capability: task-levels
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает результат проверки по каноническому route"
// @openSpec  - "Проверка уровня успешна"
// @openSpec  - "У задачи есть следующий уровень"
// @openSpec  - "Пользователь завершил максимальный уровень задачи"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { expect, test, type BrowserContext } from "playwright/test"

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

function buildLevelProgress(args: {
  currentLevel: number
  completedLevelNumbers: number[]
  maxLevel?: number
}) {
  const maxLevel = args.maxLevel ?? 5

  return Object.fromEntries(
    Array.from({ length: maxLevel }, (_, index) => {
      const levelNumber = index + 1
      const isCompleted = args.completedLevelNumbers.includes(levelNumber)

      if (levelNumber < args.currentLevel || isCompleted) {
        return [String(levelNumber), {
          status: "completed",
          isPassed: true,
          promptsUsed: 1,
          initializedAt: `2026-06-02T09:0${Math.min(levelNumber, 9)}:00.000Z`,
          completedAt: `2026-06-02T09:1${Math.min(levelNumber, 9)}:00.000Z`,
          checkAttemptsUsed: 1,
          checkingState: "idle",
        }]
      }

      if (levelNumber === args.currentLevel) {
        return [String(levelNumber), {
          status: "available",
          isPassed: false,
          promptsUsed: 0,
          checkAttemptsUsed: 0,
          checkingState: "idle",
        }]
      }

      return [String(levelNumber), {
        status: "available",
        isPassed: false,
        promptsUsed: 0,
        checkAttemptsUsed: 0,
        checkingState: "idle",
      }]
    }),
  )
}

function preparePassedCheckFixture(rootDir: string, args: {
  checkLevel: number
  currentLevel: number
  finalLevel?: boolean
}) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
  const checkResultPath = path.join(userRoot, "check-results", `${taskId}.json`)
  const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as {
    tasks: Record<string, unknown>
  }

  progress.tasks[taskId] = {
    currentLevel: args.currentLevel,
    updatedAt: "2026-06-02T09:30:00.000Z",
    levels: buildLevelProgress({
      currentLevel: args.currentLevel,
      completedLevelNumbers: args.finalLevel ? [1, 2, 3, 4, 5] : [1],
    }),
  }

  writeJson(progressPath, progress)
  fs.mkdirSync(taskRoot, { recursive: true })
  fs.writeFileSync(
    path.join(taskRoot, "Component.tsx"),
    [
      "export default function Component() {",
      `  return <button>level-${args.currentLevel}</button>`,
      "}",
      "",
    ].join("\n"),
    "utf-8",
  )
  writeJson(path.join(taskRoot, "prompt-history.json"), [
    {
      text: `Fixture prompt level ${args.checkLevel}`,
      createdAt: "2026-06-02T10:00:00.000Z",
      levelNumber: args.checkLevel,
    },
  ])
  writeJson(checkResultPath, {
    taskId,
    levelId: `level-${args.checkLevel}`,
    levelNumber: args.checkLevel,
    levelTitle: `Уровень ${args.checkLevel}`,
    attemptNumber: 1,
    maxCheckAttempts: 3,
    passed: true,
    message: args.finalLevel ? "Задача завершена" : "Можно идти дальше",
    kind: "passed",
    createdAt: "2026-06-02T10:10:00.000Z",
  })
}

async function authorizeFixtureTask(context: BrowserContext, baseURL: string | undefined) {
  const accessCookieValue = await createAccessSessionValue("e2e-check-order@example.test", fixtureAccessSalt)

  await context.addCookies([{
    name: ACCESS_COOKIE_NAME,
    value: accessCookieValue,
    url: baseURL ?? "http://127.0.0.1:3410",
    httpOnly: true,
    sameSite: "Lax",
  }])
}

test.describe("check result before next level screen", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-check-order-"))
  const userBackup = path.join(backupRoot, "user")

  test.beforeAll(() => {
    copyDir(userRoot, userBackup)
  })

  test.beforeEach(() => {
    restoreDir(userBackup, userRoot)
  })

  test.afterAll(() => {
    restoreDir(userBackup, userRoot)
    fs.rmSync(backupRoot, { recursive: true, force: true })
  })

  test("канонический check-route остаётся первым экраном, даже если следующий уровень уже стал текущим", async ({ baseURL, context, page }) => {
    preparePassedCheckFixture(repoRoot, { checkLevel: 1, currentLevel: 2 })
    await authorizeFixtureTask(context, baseURL)

    await page.goto(`/tasks/${taskId}/check`, { waitUntil: "domcontentloaded" })

    await expect(page.getByRole("heading", { name: "Проверка пройдена. Уровень Вызываем UI-библиотеку уже доступен" })).toBeVisible()
    await expect(page.getByRole("heading", { name: `Начать уровень 2 в задаче ${taskId}` })).toHaveCount(0)

    await page.getByRole("button", { name: "Вернуться к задачам уровня" }).click()

    await expect(page).toHaveURL(new RegExp("/levels/level-2$"), { timeout: 15_000 })
    await expect(page.getByRole("heading", { name: "Вызываем UI-библиотеку" })).toBeVisible()
  })

  test("последний уровень тоже сначала показывает check-result и только потом done flow", async ({ baseURL, context, page }) => {
    preparePassedCheckFixture(repoRoot, { checkLevel: 5, currentLevel: 5, finalLevel: true })
    await authorizeFixtureTask(context, baseURL)

    await page.goto(`/tasks/${taskId}/check`, { waitUntil: "domcontentloaded" })

    await expect(page.getByRole("heading", { name: "Проверка пройдена. Задача решена целиком" })).toBeVisible()
    await expect(page.getByRole("heading", { name: `Задача ${taskId} завершена на уровне 5` })).toHaveCount(0)

    await page.getByRole("button", { name: "Открыть итог задачи" }).click()

    await expect(page.getByRole("heading", { name: `Задача ${taskId} завершена на уровне 5` })).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/tasks/${taskId}/done$`), { timeout: 15_000 })
  })
})
