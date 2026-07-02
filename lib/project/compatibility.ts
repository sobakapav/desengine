import type { ProjectUiKitId } from "@/lib/project/ui-kit-config"

export type ProjectCompatibilityStatus = "compatible" | "incompatible"

export type ProjectCompatibility = {
  status: ProjectCompatibilityStatus
  message: string
}

const shadcnImportPattern = /(?:from\s+|import\s+)["']@\/components\/ui\//

function validateUiKitComponentSource(componentSource: string, uiKitId: ProjectUiKitId): ProjectCompatibility {
  if (uiKitId !== "shadcn" && shadcnImportPattern.test(componentSource)) {
    return {
      status: "incompatible",
      message: `Проект с UI kit ${uiKitId} не подключает imports из components/ui: переключите проект на shadcn или уберите shadcn-компоненты.`,
    }
  }

  return {
    status: "compatible",
    message: "Проект совместим с выбранным UI kit.",
  }
}

function resolveProjectPreviewConfig<TProject extends { settings: { uiKitId: ProjectUiKitId } }>(project: TProject) {
  return {
    ...project,
    effectiveUiKitId: project.settings.uiKitId,
  }
}

export {
  resolveProjectPreviewConfig,
  validateUiKitComponentSource,
}
