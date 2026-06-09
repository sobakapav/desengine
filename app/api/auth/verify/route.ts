import { cookies } from "next/headers"

import {
  isPlausibleEmail,
  normalizeEmail,
  shouldUseSecureCookies,
  ACCESS_COOKIE_NAME,
} from "@/lib/auth/shared"
import {
  consumeReturnPathCookie,
  createAccessCookieValue,
  verifyAllowlistAccess,
} from "@/lib/auth/server"

type Body = {
  email?: string
}

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/auth/verify", {
 *   method: "POST",
 *   body: JSON.stringify({ email: "user@example.com" }),
 * }))
 * ```
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null
  const normalizedEmail = normalizeEmail(String(body?.email || ""))

  if (!normalizedEmail || !isPlausibleEmail(normalizedEmail)) {
    return Response.json(
      { ok: false, error: "Введите корректный email." },
      { status: 400 },
    )
  }

  const result = await verifyAllowlistAccess(normalizedEmail)

  if (!result.ok) {
    const status =
      result.reason === "forbidden" ? 403 : result.reason === "misconfigured" ? 500 : 503
    const debug = process.env.NODE_ENV === "development" ? result.debug : undefined

    return Response.json(
      { ok: false, error: result.error || "Доступ не разрешён.", debug },
      { status },
    )
  }

  const cookieStore = await cookies()
  const cookieValue = await createAccessCookieValue(normalizedEmail)
  const redirectTo = await consumeReturnPathCookie()

  cookieStore.set(ACCESS_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(request.url),
    path: "/",
  })

  return Response.json({ ok: true, redirectTo })
}
