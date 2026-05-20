import type {
  OnboardingSourceMarker,
  OnboardingSyncState,
} from "@/lib/onboarding/status"

export type OnboardingLayoutStatus =
  | { ok: true }
  | { ok: false; message: string; missingPaths: string[] }

export type OnboardingSyncStatus = {
  state: OnboardingSyncState
  tone: "ready" | "warning" | "blocked"
  summary: string
  detail: string
  missingPaths: string[]
  legacyPaths: string[]
  configuredRepoUrl: string
  markerPath: string
  marker: OnboardingSourceMarker | null
}

type StatusContext = {
  legacyPaths: string[]
  configuredRepoUrl: string
  markerPath: string
}

/**
 * @example
 * ```ts
 * const status = createMissingOnboardingStatus(context, "onboarding")
 * ```
 */
export function createMissingOnboardingStatus(
  context: StatusContext,
  missingPath: string,
): OnboardingSyncStatus {
  return {
    state: "missing",
    tone: "blocked",
    summary: "Onboarding-контент отсутствует",
    detail: context.configuredRepoUrl
      ? "Каталог `/onboarding` ещё не был синхронизирован из канонического репозитория."
      : "Каталог `/onboarding` отсутствует, а канонический onboarding-репозиторий ещё не настроен.",
    missingPaths: [missingPath],
    legacyPaths: context.legacyPaths,
    configuredRepoUrl: context.configuredRepoUrl,
    markerPath: context.markerPath,
    marker: null,
  }
}

/**
 * @example
 * ```ts
 * const status = createIncompleteOnboardingStatus(context, layoutStatus)
 * ```
 */
export function createIncompleteOnboardingStatus(
  context: StatusContext,
  layoutStatus: Extract<OnboardingLayoutStatus, { ok: false }>,
): OnboardingSyncStatus {
  return {
    state: "missing",
    tone: "blocked",
    summary: "Onboarding-контент неполон",
    detail: layoutStatus.message,
    missingPaths: layoutStatus.missingPaths,
    legacyPaths: context.legacyPaths,
    configuredRepoUrl: context.configuredRepoUrl,
    markerPath: context.markerPath,
    marker: null,
  }
}

export function createMissingMarkerStatus(context: StatusContext): OnboardingSyncStatus {
  return {
    state: "unconfirmed",
    tone: "warning",
    summary: "Источник onboarding-контента не подтверждён",
    detail:
      "Каталог `/onboarding` найден, но для него нет подтверждённого маркера синхронизации. Такой каталог нужно пересинхронизировать из `ONBOARDING_REPO_URL`.",
    missingPaths: [],
    legacyPaths: context.legacyPaths,
    configuredRepoUrl: context.configuredRepoUrl,
    markerPath: context.markerPath,
    marker: null,
  }
}

/**
 * @example
 * ```ts
 * const status = createMissingRepoStatus(context, marker)
 * ```
 */
export function createMissingRepoStatus(
  context: StatusContext,
  marker: OnboardingSourceMarker,
): OnboardingSyncStatus {
  return {
    state: "unconfirmed",
    tone: "warning",
    summary: "Источник onboarding-контента не подтверждён",
    detail:
      "Для локального `/onboarding` найден маркер синхронизации, но в `desengine.config.txt` не задан `ONBOARDING_REPO_URL`, поэтому канонический источник нельзя подтвердить.",
    missingPaths: [],
    legacyPaths: context.legacyPaths,
    configuredRepoUrl: context.configuredRepoUrl,
    markerPath: context.markerPath,
    marker,
  }
}

/**
 * @example
 * ```ts
 * const status = createRepoMismatchStatus(context, marker)
 * ```
 */
export function createRepoMismatchStatus(
  context: StatusContext,
  marker: OnboardingSourceMarker,
): OnboardingSyncStatus {
  return {
    state: "unconfirmed",
    tone: "warning",
    summary: "Onboarding синхронизирован не из того репозитория",
    detail:
      `Локальный маркер указывает на ${marker.repoUrl}, а ` +
      `в конфиге задан ${context.configuredRepoUrl}. Нужна явная пересинхронизация.`,
    missingPaths: [],
    legacyPaths: context.legacyPaths,
    configuredRepoUrl: context.configuredRepoUrl,
    markerPath: context.markerPath,
    marker,
  }
}

export function createUnconfirmedMarkerStatus(context: StatusContext): OnboardingSyncStatus {
  return {
    state: "unconfirmed",
    tone: "warning",
    summary: "Источник onboarding-контента не подтверждён",
    detail:
      "Не удалось подтвердить маркер синхронизации `/onboarding`. Выполните повторную синхронизацию из `ONBOARDING_REPO_URL`.",
    missingPaths: [],
    legacyPaths: context.legacyPaths,
    configuredRepoUrl: context.configuredRepoUrl,
    markerPath: context.markerPath,
    marker: null,
  }
}

/**
 * @example
 * ```ts
 * const status = createConfirmedOnboardingStatus(context, "synced", marker)
 * ```
 */
export function createConfirmedOnboardingStatus(
  context: StatusContext,
  state: OnboardingSyncState,
  marker: OnboardingSourceMarker,
): OnboardingSyncStatus {
  const commitSuffix = marker.commitHash ? ` Коммит: ${marker.commitHash}.` : ""

  return {
    state,
    tone: "ready",
    summary: "Onboarding синхронизирован из канонического репозитория",
    detail:
      `Источник подтверждён: ${context.configuredRepoUrl}. ` +
      `Последняя синхронизация: ${marker.syncedAt}.${commitSuffix}`,
    missingPaths: [],
    legacyPaths: context.legacyPaths,
    configuredRepoUrl: context.configuredRepoUrl,
    markerPath: context.markerPath,
    marker,
  }
}
