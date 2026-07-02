// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Credentials не заданы"
// @openSpec  - "Разработчик запускает browser verification preflight"
// @openSpec  - "Разработчик проверяет browser runtime после hardening"

import { expect, test } from "playwright/test"
import { chromium } from "playwright/test"

import {
  formatBrowserVerificationFailure,
  getBrowserVerificationModeLabel,
  resolveBrowserVerificationRuntime,
} from "../helpers/browser-verification"

const runtime = resolveBrowserVerificationRuntime()

test.describe.configure({ mode: "serial" })

async function expectAuthRouteReady(page: import("playwright/test").Page) {
  await expect(page.locator("main")).toBeVisible()
  const productNavigation = page.getByRole("navigation", { name: "Глобальная навигация продукта" })

  if (await productNavigation.count()) {
    await expect(productNavigation).toBeVisible()
    return
  }

  await expect(page.getByRole("heading", { name: "Введите email" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Открыть защищённую лабораторию" })).toBeVisible()
}

test.describe("browser verification runtime", () => {
  test(`target server доступен через ${getBrowserVerificationModeLabel(runtime)}`, async ({ request }) => {
    test.skip(
      runtime.mode === "externalServer",
      "В external-server режиме shell-level target preflight запускается отдельно, вне Playwright transport.",
    )

    try {
      const response = await request.get(runtime.authURL, {
        failOnStatusCode: false,
        timeout: 15_000,
      })

      if (response.status() !== 200) {
        throw new Error(`Target server ответил статусом ${response.status()} вместо 200.`)
      }
    } catch (cause) {
      throw new Error(formatBrowserVerificationFailure({
        runtime,
        stage: "target-server",
        cause: cause instanceof Error ? cause : new Error(String(cause)),
      }))
    }
  })

  test(`chromium открывает базовый auth route через ${getBrowserVerificationModeLabel(runtime)}`, async () => {
    let browser

    try {
      browser = await chromium.launch({ channel: runtime.browserChannel })
    } catch (cause) {
      throw new Error(formatBrowserVerificationFailure({
        runtime,
        stage: "browser-launch",
        cause: cause instanceof Error ? cause : new Error(String(cause)),
      }))
    }

    const page = await browser.newPage()

    try {
      await page.goto(runtime.authURL)
      await expectAuthRouteReady(page)
    } catch (cause) {
      throw new Error(formatBrowserVerificationFailure({
        runtime,
        stage: "browser-route",
        cause: cause instanceof Error ? cause : new Error(String(cause)),
      }))
    } finally {
      await browser.close()
    }
  })
})
