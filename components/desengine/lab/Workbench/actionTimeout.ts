"use client";

const DEFAULT_WORKBENCH_ACTION_TIMEOUT_MS = 45_000;
const WORKBENCH_ACTION_TIMEOUT_OVERRIDE_KEY = "__DESENGINE_WORKBENCH_ACTION_TIMEOUT_MS__";
const timerApi = globalThis;

type WorkbenchActionErrorBody = {
  ok: false;
  error: string;
  errorKind?: string;
};

function parseWorkbenchActionTimeoutMs(rawValue: unknown): number | null {
  if (typeof rawValue !== "string" && typeof rawValue !== "number") {
    return null;
  }

  const normalized = String(rawValue).trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const timeoutMs = Number.parseInt(normalized, 10);
  return Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : null;
}

function getWorkbenchActionTimeoutMs() {
  if (typeof window !== "undefined") {
    const override = parseWorkbenchActionTimeoutMs(
      (window as Window & typeof globalThis & {
        [WORKBENCH_ACTION_TIMEOUT_OVERRIDE_KEY]?: unknown;
      })[WORKBENCH_ACTION_TIMEOUT_OVERRIDE_KEY],
    );

    if (override) {
      return override;
    }
  }

  return parseWorkbenchActionTimeoutMs(process.env.NEXT_PUBLIC_LLM_ACTION_TIMEOUT_MS)
    ?? DEFAULT_WORKBENCH_ACTION_TIMEOUT_MS;
}

function buildWorkbenchActionTimeoutMessage(actionLabel: string) {
  return `Не удалось дождаться ответа на действие "${actionLabel}". Повторите попытку.`;
}

function buildWorkbenchActionNetworkMessage(fallbackError: string) {
  return fallbackError;
}

async function fetchWorkbenchActionJson<TSuccess>(args: {
  url: string;
  init: RequestInit;
  actionLabel: string;
  fallbackError: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}): Promise<TSuccess | WorkbenchActionErrorBody> {
  const fetchImpl = args.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timeoutMs = args.timeoutMs ?? getWorkbenchActionTimeoutMs();
  let timedOut = false;

  const timeoutId = timerApi.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetchImpl(args.url, {
      ...args.init,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        error: data?.error || args.fallbackError,
        errorKind: data?.errorKind,
      };
    }

    if (!data || typeof data !== "object") {
      return { ok: false, error: args.fallbackError };
    }

    return data as TSuccess;
  } catch (error) {
    if (
      timedOut
      || (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError"))
    ) {
      return {
        ok: false,
        error: buildWorkbenchActionTimeoutMessage(args.actionLabel),
        errorKind: "timeout",
      };
    }

    return {
      ok: false,
      error: buildWorkbenchActionNetworkMessage(args.fallbackError),
      errorKind: "network",
    };
  } finally {
    timerApi.clearTimeout(timeoutId);
  }
}

export {
  DEFAULT_WORKBENCH_ACTION_TIMEOUT_MS,
  WORKBENCH_ACTION_TIMEOUT_OVERRIDE_KEY,
  buildWorkbenchActionNetworkMessage,
  buildWorkbenchActionTimeoutMessage,
  fetchWorkbenchActionJson,
  getWorkbenchActionTimeoutMs,
  parseWorkbenchActionTimeoutMs,
};
