// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает лабораторию уровня"

import fs from "node:fs"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto")

async function loadPreviewWebcryptoModule() {
  vi.resetModules()
  return import("@/components/desengine/lab/InOut/OutRender/preview-runtime-webcrypto")
}

describe("browser webcrypto runtime boundary", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()

    if (originalCryptoDescriptor) {
      Object.defineProperty(globalThis, "crypto", originalCryptoDescriptor)
      return
    }

    delete (globalThis as { crypto?: Crypto }).crypto
  })

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
    expect(webcryptoSource).toContain("function installDigestOnExistingCrypto")
    expect(webcryptoSource).toContain('Object.defineProperty(cryptoCandidate, "subtle"')
    expect(webcryptoSource).toContain("Не подменяем весь `crypto`")
    expect(webcryptoSource).not.toContain('Object.defineProperty(globalThis, "crypto"')
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

  it("не подменяет экземпляр crypto, когда fallback можно установить на существующую границу", async () => {
    vi.stubGlobal("window", {})

    const subtle = {}
    const cryptoInstance = {
      getRandomValues(buffer: Uint8Array) {
        if (this !== cryptoInstance) {
          throw new TypeError("Can only call Crypto.getRandomValues on instances of Crypto")
        }

        buffer[0] = 7
        return buffer
      },
      subtle,
    }

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: cryptoInstance,
      writable: true,
    })

    const { installPreviewDigestFallback, digestWithFallback } = await loadPreviewWebcryptoModule()

    expect(installPreviewDigestFallback()).toBe(true)
    expect(globalThis.crypto).toBe(cryptoInstance)
    expect(globalThis.crypto.subtle).toBe(subtle)
    expect(typeof globalThis.crypto.subtle.digest).toBe("function")
    expect(globalThis.crypto.getRandomValues(new Uint8Array(1))[0]).toBe(7)

    const result = await globalThis.crypto.subtle.digest("SHA-256", new Uint8Array([1, 2, 3]))
    const expected = await digestWithFallback("SHA-256", new Uint8Array([1, 2, 3]))

    expect(result).toBeInstanceOf(ArrayBuffer)
    expect(new Uint8Array(result)).toEqual(new Uint8Array(expected))
  })

  it("не ломает runtime и честно сообщает про неподдерживаемую среду, если crypto нельзя расширить", async () => {
    vi.stubGlobal("window", {})

    const cryptoInstance = Object.preventExtensions({
      getRandomValues(buffer: Uint8Array) {
        if (this !== cryptoInstance) {
          throw new TypeError("Can only call Crypto.getRandomValues on instances of Crypto")
        }

        buffer[0] = 11
        return buffer
      },
    })

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: cryptoInstance,
      writable: true,
    })

    const { installPreviewDigestFallback } = await loadPreviewWebcryptoModule()

    expect(installPreviewDigestFallback()).toBe(false)
    expect(globalThis.crypto).toBe(cryptoInstance)
    expect("subtle" in globalThis.crypto).toBe(false)
    expect(globalThis.crypto.getRandomValues(new Uint8Array(1))[0]).toBe(11)
  })
})
