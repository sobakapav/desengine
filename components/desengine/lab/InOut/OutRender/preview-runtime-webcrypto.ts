"use client"

type DigestAlgorithm = AlgorithmIdentifier | string
type DigestImplementation = (algorithm: DigestAlgorithm, data: BufferSource) => Promise<ArrayBuffer>

let previewDigestFallbackInstallAttempted = false
let previewDigestFallbackInstalled = false

function toUint8Array(data: BufferSource): Uint8Array {
  if (data instanceof Uint8Array) {
    return data
  }

  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data)
  }

  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
}

function createDigestFallbackBuffer(data: BufferSource): ArrayBuffer {
  const source = toUint8Array(data)
  const output = new Uint8Array(32)
  let stateA = 0x811c9dc5 >>> 0
  let stateB = (0x9e3779b9 ^ source.length) >>> 0

  for (let index = 0; index < output.length; index += 1) {
    const nextByte = source[index % Math.max(source.length, 1)] ?? index

    stateA ^= nextByte + index
    stateA = Math.imul(stateA ^ (stateA >>> 15), 0x85ebca6b) >>> 0

    stateB ^= stateA + index
    stateB = Math.imul(stateB ^ (stateB >>> 13), 0xc2b2ae35) >>> 0

    output[index] = (stateA ^ stateB ^ (index * 17)) & 0xff
  }

  return output.buffer
}

async function digestWithFallback(algorithm: DigestAlgorithm, data: BufferSource): Promise<ArrayBuffer> {
  const normalizedAlgorithm = typeof algorithm === "string" ? algorithm : algorithm.name

  if (normalizedAlgorithm !== "SHA-256") {
    throw new Error(`Sandpack fallback digest поддерживает только SHA-256, получен '${normalizedAlgorithm}'.`)
  }

  return createDigestFallbackBuffer(data)
}

function hasDigestImplementation() {
  return typeof globalThis.crypto?.subtle?.digest === "function"
}

function installDigestOnExistingSubtle(digest: DigestImplementation) {
  const subtleCandidate = globalThis.crypto?.subtle
  if (!subtleCandidate || typeof subtleCandidate !== "object") {
    return false
  }

  try {
    Object.defineProperty(subtleCandidate, "digest", {
      configurable: true,
      value: digest,
      writable: true,
    })
    return hasDigestImplementation()
  } catch {
    return false
  }
}

function installDigestOnCryptoObject(digest: DigestImplementation) {
  const cryptoPrototype = globalThis.crypto && typeof globalThis.crypto === "object"
    ? globalThis.crypto
    : {}
  const cryptoFallback = Object.create(cryptoPrototype)
  const subtleFallback = "subtle" in cryptoPrototype && cryptoPrototype.subtle && typeof cryptoPrototype.subtle === "object"
    ? cryptoPrototype.subtle
    : {}

  try {
    Object.defineProperty(subtleFallback, "digest", {
      configurable: true,
      value: digest,
      writable: true,
    })
    Object.defineProperty(cryptoFallback, "subtle", {
      configurable: true,
      value: subtleFallback,
      writable: true,
    })
  } catch {
    return false
  }

  try {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: cryptoFallback,
      writable: true,
    })
    return hasDigestImplementation()
  } catch {
    return false
  }
}

function installPreviewDigestFallback() {
  if (typeof window === "undefined") {
    return true
  }

  if (hasDigestImplementation()) {
    previewDigestFallbackInstallAttempted = true
    previewDigestFallbackInstalled = false
    return true
  }

  if (previewDigestFallbackInstallAttempted) {
    return hasDigestImplementation()
  }

  previewDigestFallbackInstallAttempted = true
  previewDigestFallbackInstalled = installDigestOnExistingSubtle(digestWithFallback) || installDigestOnCryptoObject(digestWithFallback)

  return previewDigestFallbackInstalled
}

export {
  digestWithFallback,
  installPreviewDigestFallback,
}
