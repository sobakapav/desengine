// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Система показывает общее пояснение уровня пользователю"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Система читает статичную task-specific подсказку уровня"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { expect, test, type BrowserContext } from "playwright/test"

import { ACCESS_COOKIE_NAME, createAccessSessionValue } from "../../lib/auth/control"
import { resolveFixtureAccessSalt } from "../helpers/fixture-access"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = resolveFixtureAccessSalt()
const taskId = "dipole-button"
const expectedTaskTip = "Ура! Наконец-то можно скруглять уголки."
const expectedLevelExplanation = "До сих пор мы жили в одном файле"

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

function prepareLevel3WorkbenchFixture(rootDir: string) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
  const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as {
    tasks: Record<string, unknown>
  }

  progress.tasks[taskId] = {
    currentLevel: 3,
    updatedAt: "2026-06-01T09:20:00.000Z",
    levels: {
      "1": {
        status: "completed",
        isPassed: true,
        promptsUsed: 1,
        initializedAt: "2026-06-01T09:00:00.000Z",
        completedAt: "2026-06-01T09:05:00.000Z",
        checkAttemptsUsed: 1,
        checkingState: "idle",
      },
      "2": {
        status: "completed",
        isPassed: true,
        promptsUsed: 2,
        initializedAt: "2026-06-01T09:10:00.000Z",
        completedAt: "2026-06-01T09:14:00.000Z",
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
      "3": {
        status: "in_progress",
        isPassed: false,
        promptsUsed: 2,
        initializedAt: "2026-06-01T09:16:00.000Z",
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
      "4": {
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
      "import { Button } from \"@/components/ui/button\"",
      "",
      "export default function Component() {",
      "  return <Button className=\"rounded-full\">CTA</Button>",
      "}",
      "",
    ].join("\n"),
    "utf-8",
  )
  fs.writeFileSync(
    path.join(taskRoot, "Component.stories.ts"),
    [
      "import Component from \"./Component\"",
      "",
      "export default { component: Component }",
      "",
    ].join("\n"),
    "utf-8",
  )
  fs.writeFileSync(
    path.join(taskRoot, "styles.ts"),
    [
      "export const buttonStyles = {",
      "  rounded: \"rounded-full\",",
      "}",
      "",
    ].join("\n"),
    "utf-8",
  )
  writeJson(path.join(taskRoot, "prompt-history.json"), [
    {
      text: "Подключи кнопку из UI kit",
      createdAt: "2026-06-01T09:10:30.000Z",
      levelNumber: 3,
    },
    {
      text: "Сделай CTA заметнее",
      createdAt: "2026-06-01T09:11:30.000Z",
      levelNumber: 3,
    },
  ])
}

async function authorizeFixtureTask(context: BrowserContext, baseURL: string | undefined) {
  const accessCookieValue = await createAccessSessionValue("e2e-level-3@example.test", fixtureAccessSalt)

  await context.addCookies([{
    name: ACCESS_COOKIE_NAME,
    value: accessCookieValue,
    url: baseURL ?? "http://127.0.0.1:3410",
    httpOnly: true,
    sameSite: "Lax",
  }])
}

test.describe("level 3 description visibility", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-level-3-description-"))
  const userBackup = path.join(backupRoot, "user")

  test.beforeAll(() => {
    copyDir(userRoot, userBackup)
  })

  test.afterAll(() => {
    restoreDir(userBackup, userRoot)
    fs.rmSync(backupRoot, { recursive: true, force: true })
  })

  test("показывает level-3 task tip и полное пояснение уровня на рабочем экране", async ({ baseURL, context, page }) => {
    prepareLevel3WorkbenchFixture(repoRoot)
    await authorizeFixtureTask(context, baseURL)

    await page.goto(`/lab/${taskId}`, { waitUntil: "domcontentloaded" })

    const contextBlock = page.getByTestId("workbench-context-block")
    await expect(contextBlock).toBeVisible()
    await expect(contextBlock).toContainText("Что важно в этой задаче")
    await expect(contextBlock).toContainText(expectedTaskTip)

    const levelExplanation = page.getByTestId("workbench-level-explanation")
    await levelExplanation.locator("summary").click()
    await expect(levelExplanation).toContainText(expectedLevelExplanation)
    await expect(levelExplanation).toContainText("styles.ts")
  })
})
