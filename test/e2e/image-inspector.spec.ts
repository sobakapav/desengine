import { expect, test } from "playwright/test"

test.describe("image-inspector", () => {
  // @openSpec capability: image-inspector
  // @openSpec - "Пользователь получает метаданные исходного изображения"
  // @openSpec - "Пользователь делает zoom и pan в инспекторе изображения"
  test("инспектор показывает метаданные и реагирует на зум", async ({ page }) => {
    const imageResponse = await page.request.get("/e2e/1x1.png")
    expect(imageResponse.status(), "PNG из public должен отдаваться").toBe(200)

    await page.goto("/e2e/image-inspector/")

    const browserImageStatus = await page.evaluate(async () => {
      const res = await fetch("/e2e/1x1.png")
      return res.status
    })
    expect(browserImageStatus, "Браузер должен получать PNG (не только page.request)").toBe(200)

    await expect(page.getByText(/^Meta:\s*1×1$/)).toBeVisible({ timeout: 20_000 })

    const percent = page.getByText(/%$/, { exact: false })
    const before = (await percent.textContent())?.trim()
    expect(before).toBeTruthy()

    const canvas = page.locator("canvas").first()
    await expect(canvas).toBeVisible({ timeout: 20_000 })

    await canvas.hover()
    await page.mouse.wheel(0, 200)

    await expect(percent).not.toHaveText(before!)
  })

  // @openSpec capability: level-labs
  // @openSpec - "Пользователь включает инспектор изображения в лаборатории"
  test("лаборатория включает инспектор через query-параметр", async ({ page }) => {
    await page.goto("/e2e/lab-image-demo/?imageInspector=1")

    await expect(page.locator("canvas").first()).toBeVisible({ timeout: 20_000 })
  })
})
