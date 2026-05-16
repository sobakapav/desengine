/** URL страницы авторизации */
function getAuthUrl() {
  return "/auth"
}

/** URL endpoint'а подготовки проходной страницы авторизации */
// TODO Адрес endpoint'а захардкожен, нехорошо, переписать
// ? А верифицирующий endpoint так не используется?
function getAuthPrepareUrl(returnTo: string) {
  return `/api/auth/prepare?returnTo=${encodeURIComponent(returnTo)}`
}

/** Отрезаем последний слеш (чистое занудство) */
function skipLastSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1)
  }

  return pathname
}

/** Требуется ли проверка доступа для этого URL */
// TODO Адреса захардкожены, подкаталоги не предусмотрены — точно нужно переписать!
export function isProtectedUrl(pathname: string) {
  const normalized = skipLastSlash(pathname)
  return normalized != "/auth"
    && normalized != "/system"
}

/** Сбрасываем подозрительные URL в null */
// ? Может быть, это в системную навигацию, а не сюда?
function sanitizeUrl(pathname: string | null | undefined) {
  if (!pathname || typeof pathname !== "string") {
    return null
  }

  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return null
  }

  if (pathname.includes("?") || pathname.includes("#")) {
    return null
  }

  const normalized = skipLastSlash(pathname)

  if (!isProtectedUrl(normalized)) {
    return null
  }

  return normalized
}

export {
    getAuthUrl,
    getAuthPrepareUrl,
    sanitizeUrl
}