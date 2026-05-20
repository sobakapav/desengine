// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь переключает UI kit проекта без перезагрузки страницы"
// @openSpec  - "Пользователь включает режим html-tags"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Sandpack preview использует project.uiKitId"
// @openSpec  - "Режим html-tags работает без UI kit"

import { expect, test, type Page } from "playwright/test"

import { ACCESS_COOKIE_NAME, createAccessSessionValue } from "../../lib/auth/control"
import { snapshotUserState, type UserStateSnapshotEntry } from "./fixtures/smoke-fixture"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = process.env.DESENGINE_E2E_ACCESS_SALT || "desengine-e2e-salt"

async function selectProjectUiKit(page: Page, uiKitId: string) {
  await page.locator("select").first().evaluate((select, value) => {
    const element = select as HTMLSelectElement
    element.value = String(value)
    element.dispatchEvent(new Event("change", { bubbles: true }))
  }, uiKitId)
}

test.describe("project UI kit switching", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")
  test.setTimeout(90_000)

  let initialUserState: UserStateSnapshotEntry[] = []

  test.beforeAll(() => {
    initialUserState = snapshotUserState()
  })

  test.afterAll(() => {
    expect(snapshotUserState()).toEqual(initialUserState)
  })

  test("переключает UI kit без перезагрузки страницы", async ({ baseURL, context, page }) => {
    const accessCookieValue = await createAccessSessionValue("e2e-ui-kit@example.test", fixtureAccessSalt)
    const labUrl = "/lab/oncor-row"

    await context.addCookies([{
      name: ACCESS_COOKIE_NAME,
      value: accessCookieValue,
      url: baseURL ?? "http://127.0.0.1:3410",
      httpOnly: true,
      sameSite: "Lax",
    }])

    const shadcnPayloadRequest = page.waitForRequest((request) => (
      request.url().includes("/api/tasks/oncor-row/sandpack")
      && request.url().includes("uiKitId=shadcn")
      && request.url().includes("uiMode=ui-kit")
    ))

    await page.goto(labUrl)
    expect((await shadcnPayloadRequest).url()).toContain("uiKitId=shadcn")
    expect(page.url()).toMatch(/\/lab\/oncor-row$/)
    await expect(page.getByText("Настройки проекта")).toBeVisible()
    await expect(page.getByText("Режим: UI kit")).toBeVisible()

    const nonePayloadRequest = page.waitForRequest((request) => (
      request.url().includes("/api/tasks/oncor-row/sandpack")
      && request.url().includes("uiKitId=none")
      && request.url().includes("uiMode=html-tags")
    ))
    await selectProjectUiKit(page, "none")
    expect((await nonePayloadRequest).url()).toContain("uiKitId=none")
    expect(page.url()).toMatch(/\/lab\/oncor-row$/)
    await expect(page.getByText("Режим: HTML-теги")).toBeVisible()

    const antPayloadRequest = page.waitForRequest((request) => (
      request.url().includes("/api/tasks/oncor-row/sandpack")
      && request.url().includes("uiKitId=ant")
      && request.url().includes("uiMode=ui-kit")
    ))
    await selectProjectUiKit(page, "ant")
    expect((await antPayloadRequest).url()).toContain("uiKitId=ant")
    expect(page.url()).toMatch(/\/lab\/oncor-row$/)
    await expect(page.getByText("Режим: UI kit")).toBeVisible()
  })
})
