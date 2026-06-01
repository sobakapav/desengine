function normalizeBaseUrl(value) {
  const normalized = (value || "").trim()

  if (!normalized) {
    throw new Error("Для browser target preflight нужен непустой DESENGINE_E2E_BASE_URL.")
  }

  let parsedUrl

  try {
    parsedUrl = new URL(normalized)
  } catch {
    throw new Error("DESENGINE_E2E_BASE_URL должен быть абсолютным URL.")
  }

  return parsedUrl.toString().replace(/\/+$/, "")
}

function resolveAuthUrl() {
  const baseUrl = normalizeBaseUrl(process.env.DESENGINE_E2E_BASE_URL || "")
  return new URL("/auth", `${baseUrl}/`).toString()
}

async function probeAuthUrl(authUrl) {
  const response = await fetch(authUrl, {
    redirect: "manual",
  })

  if (response.status !== 200) {
    throw new Error(
      `Browser target preflight ожидал HTTP 200 от ${authUrl}, получено: ${response.status}.`,
    )
  }
}

async function run() {
  const authUrl = resolveAuthUrl()

  try {
    await probeAuthUrl(authUrl)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Browser target preflight не смог подтвердить доступность ${authUrl}. ${message}`,
    )
  }

  console.log(`Browser target preflight ok: ${authUrl} -> HTTP 200`)
}

await run()
