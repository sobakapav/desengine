import localConfig from "../../lib/system/config/local.cjs"

function resolveFixtureAccessSalt(env: NodeJS.ProcessEnv = process.env) {
  const explicitSalt = env.DESENGINE_E2E_ACCESS_SALT?.trim()

  if (explicitSalt) {
    return explicitSalt
  }

  const configuredSalt = env.ALLOWLIST_SALT?.trim() || env.DESENGINE_ALLOWLIST_SALT?.trim()

  if (configuredSalt) {
    return configuredSalt
  }

  localConfig.loadLocalConfig()

  return process.env.ALLOWLIST_SALT?.trim()
    || process.env.DESENGINE_ALLOWLIST_SALT?.trim()
    || "desengine-e2e-salt"
}

export {
  resolveFixtureAccessSalt,
}
