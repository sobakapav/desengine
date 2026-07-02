import { expect, test } from "playwright/test"

test.describe.configure({ mode: "serial" })

const publicRoutes = ["/auth", "/help"]

const protectedRoutes = [
  "/",
  "/projects",
  "/system",
]

async function expectAuthRouteReady(page: import("playwright/test").Page) {
  await expect(page.getByRole("navigation", { name: "Глобальная навигация продукта" })).toBeVisible()
  await expect(page.locator("main")).toBeVisible()
  await expect(page.getByText("Доступ в лабораторию")).toBeVisible()
}

test.describe("route smoke без live credentials", () => {
  for (const route of publicRoutes) {
    test(`публичный маршрут ${route} открывается без допуска`, async ({ page }) => {
      await page.goto(route)

      await expect(page.getByRole("navigation", { name: "Глобальная навигация продукта" })).toBeVisible()
      await expect(page.getByRole("link", { name: "проекты" })).toBeVisible()
      await expect(page.getByRole("link", { name: "система" })).toBeVisible()
      await expect(page.getByRole("link", { name: "tg-полубот помощи" })).toBeVisible()
      await expect(page.getByRole("link", { name: "edu@eduhund.com" })).toBeVisible()
    })
  }

  for (const route of protectedRoutes) {
    test(`защищённый маршрут ${route} без допуска переводит на /auth`, async ({ page }) => {
      await page.goto(route)

      await expect(page).toHaveURL(/\/auth$/)
      await expectAuthRouteReady(page)
    })
  }

  test("защищённый help asset без допуска возвращает 401", async ({ request }) => {
    const response = await request.get("/help/images/help-placeholder.svg")

    expect(response.status()).toBe(401)
  })
})
