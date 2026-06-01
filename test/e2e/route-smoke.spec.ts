import { expect, test } from "playwright/test"

import {
  e2eSmokeRoutes,
  projectUserStateInvariant,
  snapshotUserState,
  type UserStateSnapshotEntry,
} from "./fixtures/smoke-fixture"

test.describe.configure({ mode: "serial" })

async function expectAuthRouteReady(page: import("playwright/test").Page) {
  await expect(page.getByRole("navigation", { name: "Глобальная навигация продукта" })).toBeVisible()
  await expect(page.locator("main")).toBeVisible()
  await expect(page.getByText("Доступ в лабораторию")).toBeVisible()
}

let initialUserState: UserStateSnapshotEntry[] = []

test.beforeAll(() => {
  initialUserState = snapshotUserState()
})

test.afterAll(() => {
  expect(projectUserStateInvariant(snapshotUserState())).toEqual(projectUserStateInvariant(initialUserState))
})

test.describe("route smoke без live credentials", () => {
  for (const route of e2eSmokeRoutes.publicRoutes) {
    test(`публичный маршрут ${route} открывается без допуска`, async ({ page }) => {
      await page.goto(route)

      await expect(page.getByRole("navigation", { name: "Глобальная навигация продукта" })).toBeVisible()
      await expect(page.getByRole("link", { name: "задачи" })).toBeVisible()
      await expect(page.getByRole("link", { name: "уровни" })).toBeVisible()
      await expect(page.getByRole("link", { name: "tg-полубот помощи" })).toBeVisible()
      await expect(page.getByRole("link", { name: "edu@eduhund.com" })).toBeVisible()
    })
  }

  for (const route of e2eSmokeRoutes.protectedRoutes) {
    test(`защищённый маршрут ${route.path} без допуска переводит на /auth`, async ({ page }) => {
      const skipReason = "skipReason" in route ? route.skipReason : undefined
      test.skip(Boolean(skipReason), skipReason)

      await page.goto(route.path)

      await expect(page).toHaveURL(/\/auth$/)
      await expectAuthRouteReady(page)
    })
  }

  test("защищённый help asset без допуска возвращает 401", async ({ request }) => {
    const response = await request.get("/help/images/help-placeholder.svg")

    expect(response.status()).toBe(401)
  })
})
