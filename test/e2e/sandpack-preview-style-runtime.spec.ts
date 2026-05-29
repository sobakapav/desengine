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
import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
} from "../../lib/project/storage"
import { snapshotUserState, type UserStateSnapshotEntry } from "./fixtures/smoke-fixture"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = process.env.DESENGINE_E2E_ACCESS_SALT || "desengine-e2e-salt"

function buildProjectStorageValue(taskId: string, overrides: {
  uiKitId: "shadcn" | "none" | "ant"
  uiMode: "ui-kit" | "html-tags"
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

function prepareStartedTaskFixture(rootDir: string, taskId: string, options: {
  currentLevel: number
  componentSource: string
  stylesSource?: string
}) {
  const userRoot = path.join(rootDir, "user")
  const progressPath = path.join(userRoot, "user-progress.json")
  const taskRoot = path.join(userRoot, "tasks", taskId)
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
        promptsUsed: 0,
        initializedAt: "2026-05-28T09:00:00.000Z",
        ...(options.currentLevel === 1 ? {} : { completedAt: "2026-05-28T09:01:00.000Z" }),
        checkAttemptsUsed: 0,
        checkingState: "idle",
      },
      "2": {
        status: options.currentLevel === 2 ? "in_progress" : options.currentLevel > 2 ? "completed" : "available",
        isPassed: options.currentLevel > 2,
        promptsUsed: 0,
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
  fs.mkdirSync(taskRoot, { recursive: true })
  fs.writeFileSync(path.join(taskRoot, "Component.tsx"), options.componentSource, "utf-8")

  if (typeof options.stylesSource === "string") {
    fs.writeFileSync(path.join(taskRoot, "styles.ts"), options.stylesSource, "utf-8")
  }
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
  uiMode: "ui-kit" | "html-tags"
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
    <div className="w-[57px] h-[16px] bg-gray-200 flex items-center justify-center">
      <span className="text-xs text-gray-600">Base</span>
    </div>
  );
}
`,
    })
    await authorizeFixtureTask(context, baseURL)
    await seedProjectStorage(page, "dipole-checkbox", { uiKitId: "shadcn", uiMode: "ui-kit" })

    await page.goto("/lab/dipole-checkbox")

    await expect(page.locator(".sp-preview-iframe")).toBeVisible({ timeout: 20_000 })
    const previewFrame = page.frameLocator(".sp-preview-iframe")
    const contractHtml = previewFrame.locator("html")

    try {
      await expect(contractHtml).toHaveAttribute("data-desengine-preview-contract", "ready", { timeout: 20_000 })

      const previewCard = previewFrame.locator("div").first()
      await expect(previewCard).toHaveCSS("background-color", "rgb(229, 231, 235)")
      await expect(previewCard).toHaveCSS("width", "57px")
      await expect(previewCard).toHaveCSS("height", "16px")
    } catch {
      await expect(page.getByText("Preview отрисовал DOM без подтверждённого style contract.")).toBeVisible({ timeout: 20_000 })
      await expect(page.getByText(/Sandpack runtime не подтвердил загрузку превью|Sandpack отрисовал DOM, но preview CSS\/Tailwind не применились к probe-элементу\./)).toBeVisible({ timeout: 20_000 })
    }
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
    await seedProjectStorage(page, "mp-inspector-progress-container", { uiKitId: "none", uiMode: "html-tags" })

    await page.goto("/lab/mp-inspector-progress-container")

    await expect(page.getByText("Режим html-tags не подключает UI kit")).toBeVisible({ timeout: 20_000 })
    await expect(page.locator(".sp-preview-iframe")).toBeHidden()
  })

  test("поднимает runtime-ошибку компонента в host diagnostics", async ({ baseURL, context, page }) => {
    prepareStartedTaskFixture(repoRoot, "dipole-checkbox", {
      currentLevel: 1,
      componentSource: `export default function Component() {
  return <div>Preview runtime contract</div>;
}
`,
    })
    await authorizeFixtureTask(context, baseURL)
    await seedProjectStorage(page, "dipole-checkbox", { uiKitId: "shadcn", uiMode: "ui-kit" })

    await page.goto("/lab/dipole-checkbox")
    await page.waitForTimeout(1_000)

    await page.evaluate(() => {
      const payload = {
        source: "desengine-sandpack-preview",
        type: "contract",
        status: "render-error",
        message: "Тестовая runtime-ошибка preview",
      }

      window.postMessage(payload, "*")
      window.setTimeout(() => window.postMessage(payload, "*"), 150)
      window.setTimeout(() => window.postMessage(payload, "*"), 350)
    })

    await expect(page.getByText("Preview отрисовал DOM без подтверждённого style contract.")).toBeVisible({ timeout: 20_000 })
    await expect(page.getByText(/Тестовая runtime-ошибка preview/)).toBeVisible({ timeout: 20_000 })
  })
})
