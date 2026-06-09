// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает лабораторию уровня"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("browser webcrypto runtime boundary", () => {
  it("пытается установить узкий digest-fallback до отказа от preview", () => {
    const outRenderSource = readProjectFile(
      "components",
      "desengine",
      "lab",
      "InOut",
      "OutRender",
      "OutRender.tsx",
    )
    const noticesSource = readProjectFile(
      "components",
      "desengine",
      "lab",
      "InOut",
      "OutRender",
      "preview-runtime-notices.tsx",
    )
    const webcryptoSource = readProjectFile(
      "components",
      "desengine",
      "lab",
      "InOut",
      "OutRender",
      "preview-runtime-webcrypto.ts",
    )

    expect(noticesSource).toContain("function getPreviewRuntimeSupport()")
    expect(noticesSource).toContain("installPreviewDigestFallback()")
    expect(noticesSource).not.toContain("window.isSecureContext === false")
    expect(noticesSource).not.toContain("!globalThis.crypto?.subtle")
    expect(webcryptoSource).toContain("async function digestWithFallback")
    expect(webcryptoSource).toContain('normalizedAlgorithm !== "SHA-256"')
    expect(webcryptoSource).toContain("function installDigestOnExistingSubtle")
    expect(webcryptoSource).toContain('Object.defineProperty(subtleCandidate, "digest"')
    expect(webcryptoSource).toContain("function installDigestOnCryptoObject")
    expect(webcryptoSource).toContain('Object.defineProperty(cryptoFallback, "subtle"')
    expect(webcryptoSource).toContain('Object.defineProperty(globalThis, "crypto"')
    expect(outRenderSource).toContain("if (!previewRuntimeSupport.supported)")
    expect(outRenderSource).toContain("<PreviewSecureContextNotice message={previewRuntimeSupport.message} />")

    const unsupportedGuardIndex = outRenderSource.indexOf("if (!previewRuntimeSupport.supported)")
    const sandpackSurfaceIndex = outRenderSource.indexOf("<SandpackRuntimeSurface")

    expect(unsupportedGuardIndex).toBeGreaterThan(-1)
    expect(sandpackSurfaceIndex).toBeGreaterThan(-1)
    expect(unsupportedGuardIndex).toBeLessThan(sandpackSurfaceIndex)
  })

  it("показывает пользователю понятное secure-context notice на русском", () => {
    const noticesSource = readProjectFile(
      "components",
      "desengine",
      "lab",
      "InOut",
      "OutRender",
      "preview-runtime-notices.tsx",
    )

    expect(noticesSource).toContain("Превью сейчас не запускается в этом браузерном окружении.")
    expect(noticesSource).toContain("Превью нельзя запустить в текущем окружении")
    expect(noticesSource).toContain("не позволил установить локальный fallback для Sandpack")
    expect(noticesSource).toContain("HTTPS")
    expect(noticesSource).toContain("совместимый браузер")
  })
})
