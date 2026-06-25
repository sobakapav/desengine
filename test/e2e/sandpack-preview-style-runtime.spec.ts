// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Preview применяет Tailwind arbitrary values и ширину компонента"
// @openSpec  - "Preview показывает безопасный fallback при несовместимости проекта"
// @openSpec  - "Preview поднимает runtime-ошибку Sandpack в host UI"
// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Система выбирает Sandpack App template по уровню задачи"

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
  const now = "2026-05-28T00:00:00.000Z"

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

function prepareStartedTaskFixture(rootDir: string, taskId: string, options: {
  currentLevel: number
  componentSource: string
  stylesSource?: string
}) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
  const checkResultPath = path.join(userRoot, "check-results", `${taskId}.json`)
  const progress = JSON.parse(fs.readFileSync(progressPath, "utf-8")) as {
    tasks: Record<string, {
      currentLevel: number
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
    currentLevel: options.currentLevel,
    updatedAt: "2026-05-28T09:06:00.000Z",
    levels: {
      "1": {
        status: options.currentLevel === 1 ? "in_progress" : "completed",
        isPassed: options.currentLevel !== 1,
        promptsUsed: options.currentLevel > 1 ? 1 : 0,
        initializedAt: "2026-05-28T09:00:00.000Z",
        ...(options.currentLevel === 1 ? {} : { completedAt: "2026-05-28T09:01:00.000Z" }),
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
      "2": {
        status: options.currentLevel === 2 ? "in_progress" : options.currentLevel > 2 ? "completed" : "available",
        isPassed: options.currentLevel > 2,
        promptsUsed: options.currentLevel > 2 ? 1 : 0,
        ...(options.currentLevel >= 2 ? { initializedAt: "2026-05-28T09:02:00.000Z" } : {}),
        ...(options.currentLevel > 2 ? { completedAt: "2026-05-28T09:03:00.000Z" } : {}),
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
      "3": {
        status: options.currentLevel === 3 ? "in_progress" : "available",
        isPassed: false,
        promptsUsed: 0,
        ...(options.currentLevel === 3 ? { initializedAt: "2026-05-28T09:04:00.000Z" } : {}),
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
    },
  }

  writeJson(progressPath, progress)
  fs.rmSync(taskRoot, { recursive: true, force: true })
  fs.mkdirSync(taskRoot, { recursive: true })
  fs.writeFileSync(path.join(taskRoot, "Component.tsx"), options.componentSource, "utf-8")
  writeJson(path.join(taskRoot, "prompt-history.json"), buildFixturePromptHistory(options.currentLevel))

  if (typeof options.stylesSource === "string") {
    fs.writeFileSync(path.join(taskRoot, "styles.ts"), options.stylesSource, "utf-8")
  }

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

async function waitForPreviewReady(page: Page) {
  await expect(page.locator(".sp-preview-iframe")).toBeVisible({ timeout: 20_000 })
  const previewFrame = page.frameLocator(".sp-preview-iframe")
  await expect(previewFrame.locator("html")).toHaveAttribute("data-desengine-preview-contract", "ready", { timeout: 20_000 })
  await expect(page.getByText("Preview отрисовал DOM без подтверждённого style contract.")).toBeHidden()
  await expect(page.getByText("Компонент не удалось отрендерить в preview.")).toBeHidden()
  return previewFrame
}

test.describe("sandpack preview style runtime", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  const repoRoot = process.cwd()
  const userRoot = path.join(repoRoot, "user")
  const backupRoot = fs.mkdtempSync(path.join(os.tmpdir(), "desengine-sandpack-preview-"))
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

  test("не оставляет пользователя с пустым preview без style-contract диагноза", async ({ baseURL, context, page }) => {
    prepareStartedTaskFixture(repoRoot, "dipole-checkbox", {
      currentLevel: 1,
      componentSource: `import React from "react";

export default function Component() {
  return (
    <div data-testid="preview-card" className="w-[57px] h-[16px] bg-gray-200 flex items-center justify-center">
      <span className="text-xs text-gray-600">Base</span>
    </div>
  );
}
`,
    })
    await authorizeFixtureTask(context, baseURL)
    await seedProjectStorage(page, "dipole-checkbox", { uiKitId: "shadcn" })

    await page.goto("/lab/dipole-checkbox")

    const previewFrame = await waitForPreviewReady(page)

    const previewCard = previewFrame.getByTestId("preview-card")
    await expect(previewCard).toHaveCSS("width", "57px")
    await expect(previewCard).toHaveCSS("height", "16px")
    const backgroundColor = await previewCard.evaluate((element) => getComputedStyle(element).backgroundColor)
    expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  test("показывает incompatibility fallback вместо ложного успешного рендера", async ({ baseURL, context, page }) => {
    prepareStartedTaskFixture(repoRoot, "mp-inspector-progress-container", {
      currentLevel: 3,
      componentSource: `import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, Settings } from "lucide-react";
import { styles } from "./styles";

export default function Component() {
  return (
    <Tabs defaultValue="home" className={styles.tabsRoot}>
      <TabsList className={styles.tabsList}>
        <TabsTrigger value="home" className={styles.tabsTrigger}>
          <Home className={styles.icon} />
          <span className={styles.label}>Home</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className={styles.tabsTrigger}>
          <User className={styles.icon} />
          <span className={styles.label}>Profile</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className={styles.tabsTrigger}>
          <Settings className={styles.icon} />
          <span className={styles.label}>Settings</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
`,
      stylesSource: `export const styles = {
  tabsRoot: "w-full max-w-[748px] h-[60px]",
  tabsList: "flex justify-between w-full h-full",
  tabsTrigger: "flex flex-col items-center gap-1",
  icon: "h-3 w-3",
  label: "text-xs",
};
`,
    })
    await authorizeFixtureTask(context, baseURL)
    await seedProjectStorage(page, "mp-inspector-progress-container", { uiKitId: "none" })

    await page.goto("/lab/mp-inspector-progress-container")

    await expect(page.getByText("Проект с UI kit none не подключает imports из components/ui")).toBeVisible({ timeout: 20_000 })
    await expect(page.locator(".sp-preview-iframe")).toBeHidden()
  })

  test("поднимает runtime-ошибку компонента в host diagnostics", async ({ baseURL, context, page }) => {
    prepareStartedTaskFixture(repoRoot, "dipole-checkbox", {
      currentLevel: 1,
      componentSource: `export default function Component() {
  throw new Error("Тестовая runtime-ошибка preview");
}
`,
    })
    await authorizeFixtureTask(context, baseURL)
    await seedProjectStorage(page, "dipole-checkbox", { uiKitId: "shadcn" })

    await page.goto("/lab/dipole-checkbox")
    await expect(page.getByText("Компонент не удалось отрендерить в preview.")).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText("Preview отрисовал DOM без подтверждённого style contract.")).toBeHidden()
    await expect(page.getByText("Тестовая runtime-ошибка preview", { exact: true })).toBeVisible({ timeout: 20_000 })
  })

  test("стабильно рендерит Radix-based preview path через реальный payload", async ({ baseURL, context, page }) => {
    prepareStartedTaskFixture(repoRoot, "dipole-checkbox", {
      currentLevel: 1,
      componentSource: `import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function Component() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button data-testid="open-preview-dialog">Открыть preview dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Radix preview dialog</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction>Подтвердить</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
`,
    })
    await authorizeFixtureTask(context, baseURL)
    await seedProjectStorage(page, "dipole-checkbox", { uiKitId: "shadcn" })

    await page.goto("/lab/dipole-checkbox")

    const previewFrame = await waitForPreviewReady(page)
    await previewFrame.getByTestId("open-preview-dialog").click()
    await expect(previewFrame.getByText("Radix preview dialog")).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText("Компонент не удалось отрендерить в preview.")).toBeHidden()
    await expect(page.getByText(/createSlot|Preview runtime error|not a function/)).toBeHidden()
  })
})
