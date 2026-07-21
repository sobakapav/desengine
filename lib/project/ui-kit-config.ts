import {
  DEFAULT_UI_KIT_ADAPTER_ID,
  normalizeUiKitAdapterId,
  uiKitAdapterRegistry,
  validateUiKitAdapterRegistry,
  type UiKitAdapter,
  type UiKitAdapterId,
} from "@/lib/ui-kit"

type ProjectUiKitId = UiKitAdapterId
type ProjectUiKitConfig = UiKitAdapter

const DEFAULT_PROJECT_UI_KIT_ID: ProjectUiKitId = DEFAULT_UI_KIT_ADAPTER_ID
const projectUiKitsConfig = uiKitAdapterRegistry

function normalizeProjectUiKitId(rawUiKitId?: string | null): ProjectUiKitId {
  return normalizeUiKitAdapterId(rawUiKitId)
}

function validateProjectUiKitsConfig() {
  validateUiKitAdapterRegistry()
}

export {
  DEFAULT_PROJECT_UI_KIT_ID,
  normalizeProjectUiKitId,
  projectUiKitsConfig,
  validateProjectUiKitsConfig,
  type ProjectUiKitConfig,
  type ProjectUiKitId,
}
