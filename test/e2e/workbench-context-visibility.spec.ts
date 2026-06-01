// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает конкретную задачу на уровне"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { expect, test, type Locator, type Page } from "playwright/test"

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

function prepareWorkbenchVisibilityFixture(rootDir: string) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
  const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as {
    tasks: Record<string, unknown>
  }

  progress.tasks[taskId] = {
    currentLevel: 2,
    updatedAt: "2026-06-01T09:15:00.000Z",
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
        status: "in_progress",
        isPassed: false,
        promptsUsed: 2,
        initializedAt: "2026-06-01T09:10:00.000Z",
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
  fs.mkdirSync(taskRoot, { recursive: true })
  fs.writeFileSync(
    path.join(taskRoot, "Component.tsx"),
    [
      "import { Button } from \"@/components/ui/button\"",
      "",
      "export default function Component() {",
      "  return <Button>CTA</Button>",
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
      "  background: \"var(--primary)\",",
      "}",
      "",
    ].join("\n"),
    "utf-8",
  )
  writeJson(path.join(taskRoot, "prompt-history.json"), [
    {
      text: "Подключи кнопку из UI kit",
      createdAt: "2026-06-01T09:10:30.000Z",
      levelNumber: 2,
    },
    {
      text: "Сделай CTA заметнее",
      createdAt: "2026-06-01T09:11:30.000Z",
      levelNumber: 2,
    },
  ])
}

async function expectVisibleInsideViewport(page: Page, locator: Locator) {
  const box = await locator.boundingBox()
  const viewport = page.viewportSize()

  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()

  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height)
}

test.describe("workbench context visibility", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-workbench-context-"))
  const userBackup = path.join(backupRoot, "user")

  test.beforeAll(() => {
    copyDir(userRoot, userBackup)
  })

  test.afterAll(() => {
    restoreDir(userBackup, userRoot)
    fs.rmSync(backupRoot, { recursive: true, force: true })
  })

  test("держит preview и context в первом экране и не прячет новый styles.ts", async ({ baseURL, context, page }) => {
    prepareWorkbenchVisibilityFixture(repoRoot)

    const accessCookieValue = await createAccessSessionValue("e2e-workbench@example.test", fixtureAccessSalt)
    await context.addCookies([{
      name: ACCESS_COOKIE_NAME,
      value: accessCookieValue,
      url: baseURL ?? "http://127.0.0.1:3410",
      httpOnly: true,
      sameSite: "Lax",
    }])

    await page.setViewportSize({ width: 1440, height: 960 })
    await page.goto(`/lab/${taskId}`)

    await expect(page.getByText("Рабочий стол")).toBeVisible()
    await expect(page.getByText("Что важно в этой задаче")).toBeVisible()

    const previewBlock = page.getByTestId("workbench-preview-block")
    const contextBlock = page.getByTestId("workbench-context-block")
    const statusBlock = page.getByTestId("workbench-context-status")

    await expect(previewBlock).toBeVisible()
    await expect(contextBlock).toBeVisible()
    await expect(statusBlock).toContainText("Уровень")
    await expect(statusBlock).toContainText("2 из 5")
    await expect(statusBlock).toContainText("Промпты")
    await expect(statusBlock).toContainText("2 / 3")
    await expect(statusBlock).toContainText("Файлы")
    await expect(contextBlock).toContainText("styles.ts")

    await expectVisibleInsideViewport(page, previewBlock)
    await expectVisibleInsideViewport(page, contextBlock)

    const explanation = page.getByTestId("workbench-level-explanation")
    await explanation.locator("summary").click()
    await expect(explanation).toContainText("Вы получили код компонента из ничего")

    const newFileCallout = page.getByTestId("code-new-file-callout")
    const newStylesBadge = page.getByTestId("code-tab-badge-new-styles")
    const stylesTab = page.getByTestId("code-tab-styles")

    await expect(newFileCallout).toContainText("styles.ts")
    await expect(newStylesBadge).toBeVisible()
    await expect(stylesTab).toHaveAttribute("data-state", "active")
    await expect(page.getByText("styles.ts").first()).toBeVisible()
  })
})
