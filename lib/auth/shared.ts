const ACCESS_COOKIE_NAME = "desengine-access"

const ALLOWLIST_BASE_URL_ENV = "ALLOWLIST_BASE_URL"
const ALLOWLIST_SALT_ENV = "ALLOWLIST_SALT"

function getAccessControlConfig() {
  const baseUrl =
    process.env[ALLOWLIST_BASE_URL_ENV]?.trim()
    || process.env.DESENGINE_ALLOWLIST_BASE_URL?.trim()
    || ""
  const salt =
    process.env[ALLOWLIST_SALT_ENV]?.trim()
    || process.env.DESENGINE_ALLOWLIST_SALT?.trim()
    || ""

  return {
    baseUrl,
    salt,
    isConfigured: Boolean(baseUrl && salt),
  }
}

function shouldUseSecureCookies(requestUrl: string): boolean {
  try {
    return new URL(requestUrl).protocol === "https:"
  } catch {
    return false
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isPlausibleEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export {
  ACCESS_COOKIE_NAME,
  ALLOWLIST_BASE_URL_ENV,
  ALLOWLIST_SALT_ENV,
  getAccessControlConfig,
  isPlausibleEmail,
  normalizeEmail,
  shouldUseSecureCookies,
}
