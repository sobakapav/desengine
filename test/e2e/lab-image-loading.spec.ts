// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import { expect, test } from "playwright/test"

import { ACCESS_COOKIE_NAME, createAccessSessionValue } from "../../lib/auth/control"

const fixtureAccessEnabled = process.env.DESENGINE_E2E_FIXTURE_ACCESS === "1"
const fixtureAccessSalt = process.env.DESENGINE_E2E_ACCESS_SALT || "desengine-e2e-salt"

test.describe("lab image loading", () => {
  test.skip(!fixtureAccessEnabled, "Нужен fixture-доступ: DESENGINE_E2E_FIXTURE_ACCESS=1")

  test("лаборатория загружает base image для задачи", async ({ baseURL, context, page }) => {
    const accessCookieValue = await createAccessSessionValue("e2e-image@example.test", fixtureAccessSalt)

    await context.addCookies([{
      name: ACCESS_COOKIE_NAME,
      value: accessCookieValue,
      url: baseURL ?? "http://127.0.0.1:3410",
      httpOnly: true,
      sameSite: "Lax",
    }])

    const imageResponsePromise = page.waitForResponse((response) => (
      response.url().includes("/api/tasks/dipole-checkbox/image")
      && response.request().method() === "GET"
    ))

    await page.goto("/lab/dipole-checkbox")

    const imageResponse = await imageResponsePromise
    expect(imageResponse.status()).toBe(200)
    await expect(page.getByText("Не удалось загрузить изображение")).toHaveCount(0)
  })
})
