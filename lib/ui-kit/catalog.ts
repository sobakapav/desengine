import { antUiKitAdapter } from "./adapters/ant"
import { muiUiKitAdapter } from "./adapters/mui"
import { noneUiKitAdapter } from "./adapters/none"
import { shadcnUiKitAdapter } from "./adapters/shadcn"
import type { UiKitAdapter } from "./types"

const bundledUiKitAdapters = [
  noneUiKitAdapter,
  shadcnUiKitAdapter,
  antUiKitAdapter,
  muiUiKitAdapter,
] as const satisfies readonly UiKitAdapter[]

type UiKitAdapterId = typeof bundledUiKitAdapters[number]["id"]

const DEFAULT_UI_KIT_ADAPTER_ID: UiKitAdapterId = "shadcn"

const uiKitAdapterRegistry = Object.fromEntries(
  bundledUiKitAdapters.map((adapter) => [adapter.id, adapter]),
) as Record<UiKitAdapterId, UiKitAdapter>

function resolveUiKitAdapterByRawId(rawUiKitId?: string | null) {
  const raw = rawUiKitId?.trim().toLowerCase()
  if (!raw) {
    return uiKitAdapterRegistry[DEFAULT_UI_KIT_ADAPTER_ID]
  }

  for (const adapter of bundledUiKitAdapters) {
    if (adapter.id === raw || adapter.aliases?.includes(raw)) {
      return adapter
    }
  }

  return uiKitAdapterRegistry[DEFAULT_UI_KIT_ADAPTER_ID]
}

function normalizeUiKitAdapterId(rawUiKitId?: string | null): UiKitAdapterId {
  return resolveUiKitAdapterByRawId(rawUiKitId).id as UiKitAdapterId
}

function validateUiKitAdapterRegistry() {
  const ids = bundledUiKitAdapters.map((adapter) => adapter.id)
  const uniqueIds = new Set(ids)

  if (ids.length !== uniqueIds.size) {
    throw new Error("Некорректный registry UI kit adapter'ов: повторяющиеся id")
  }

  for (const adapter of bundledUiKitAdapters) {
    if (!adapter.id.trim()) {
      throw new Error("Некорректный registry UI kit adapter'ов: пустой id")
    }

    if (!adapter.title.trim()) {
      throw new Error(`Некорректный registry UI kit adapter'ов: adapter '${adapter.id}' без title`)
    }
  }
}

export {
  DEFAULT_UI_KIT_ADAPTER_ID,
  bundledUiKitAdapters,
  normalizeUiKitAdapterId,
  resolveUiKitAdapterByRawId,
  uiKitAdapterRegistry,
  validateUiKitAdapterRegistry,
}

export type {
  UiKitAdapterId,
}
