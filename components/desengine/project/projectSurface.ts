import { projectUiKitsConfig } from "@/lib/project/ui-kit-config"
import type { ProjectSurfaceSummary } from "@/lib/project/client"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import { PROJECT_STORAGE_LABEL } from "./projectStorageLabels"
import {
  formatProjectSurfaceCount,
  formatProjectSurfaceTimestamp,
  type ProjectConfigContractModel,
  type ProjectSurfaceModel,
  type ProjectUiKitOption,
} from "./projectSurfaceShared"
import {
  buildProjectComponentSurfaceModel,
  buildProjectHistoryDiagnosticsModel,
  buildProjectWorkflowReadoutModel,
  resolveProjectComponentStatusLabel,
  resolveProjectComponentWorkflowLabel,
} from "./projectSurfaceRuntime"

function resolveProjectUiKitTitle(project: ProjectWorkspace) {
  return projectUiKitsConfig[project.settings.uiKitId].title
}

function listProjectUiKitOptions(): ProjectUiKitOption[] {
  return Object.values(projectUiKitsConfig).map((kit) => ({
    id: kit.id,
    title: kit.title,
  }))
}

function buildProjectConfigContractModel(project: ProjectWorkspace, code?: string): ProjectConfigContractModel {
  const selectedUiKit = projectUiKitsConfig[project.settings.uiKitId]
  const projectCode = code?.trim() || project.metadata.code || project.id

  return {
    code: projectCode,
    selectedUiKitId: selectedUiKit.id,
    selectedUiKitTitle: selectedUiKit.title,
    promptPreviewContractJson: JSON.stringify({
      project: {
        code: projectCode,
        uiKitId: project.settings.uiKitId,
        uiKitTitle: selectedUiKit.title,
      },
      promptTemplates: {
        projectFields: [
          "project.code",
          "project.uiKitId",
          "project.uiKitTitle",
        ],
        userFields: [
          "user.designSystemId",
          "user.designSystemName",
        ],
      },
      previewRuntime: {
        uiKitId: project.settings.uiKitId,
      },
    }, null, 2),
  }
}

function buildProjectSourcesSummaryLabels(surface: ProjectSurfaceSummary | null) {
  const figmaCount = surface?.figmaFiles.length ?? 0
  const archiveFileCount = surface?.archiveGroups.reduce((sum, group) => sum + group.fileCount, 0) ?? 0

  return {
    code: surface?.metadata.code ?? "",
    figmaFilesCountLabel: figmaCount > 0
      ? formatProjectSurfaceCount(figmaCount, "Figma-файл", "Figma-файла", "Figma-файлов")
      : "Figma-файлы не привязаны",
    componentGraphLabel: surface?.componentGraph.storagePath
      ? `${surface.componentGraph.nodeCount} узл. / ${surface.componentGraph.edgeCount} связей`
      : "граф компонентов ещё не зафиксирован",
    screenGraphLabel: surface?.screenGraph.storagePath
      ? `${surface.screenGraph.nodeCount} узл. / ${surface.screenGraph.edgeCount} связей`
      : "граф экранов ещё не зафиксирован",
    archiveSummaryLabel: archiveFileCount > 0
      ? formatProjectSurfaceCount(archiveFileCount, "файл архива", "файла архива", "файлов архива")
      : "архив пока пуст",
  }
}

function buildProjectSurfaceModel(
  project: ProjectWorkspace,
  isActive: boolean,
  rootPath?: string | null,
  surface?: ProjectSurfaceSummary | null,
): ProjectSurfaceModel {
  const sourceLabels = buildProjectSourcesSummaryLabels(surface ?? null)

  return {
    id: project.id,
    title: project.title,
    code: sourceLabels.code || project.metadata.code || project.id,
    isActive,
    uiKitTitle: resolveProjectUiKitTitle(project),
    storageLabel: PROJECT_STORAGE_LABEL,
    rootPathLabel: rootPath?.trim() || "server path пока не прочитан",
    createdAtLabel: formatProjectSurfaceTimestamp(project.createdAt),
    updatedAtLabel: formatProjectSurfaceTimestamp(project.updatedAt),
    figmaFilesCountLabel: sourceLabels.figmaFilesCountLabel,
    componentGraphLabel: sourceLabels.componentGraphLabel,
    screenGraphLabel: sourceLabels.screenGraphLabel,
    archiveSummaryLabel: sourceLabels.archiveSummaryLabel,
  }
}

function sortProjectsForSurface(
  projects: Array<{ project: ProjectWorkspace; rootPath: string }>,
  activeProjectId: string | null,
) {
  return [...projects].sort((left, right) => {
    if (left.project.id === activeProjectId && right.project.id !== activeProjectId) {
      return -1
    }

    if (right.project.id === activeProjectId && left.project.id !== activeProjectId) {
      return 1
    }

    return right.project.updatedAt.localeCompare(left.project.updatedAt)
  })
}

export {
  buildProjectComponentSurfaceModel,
  buildProjectHistoryDiagnosticsModel,
  buildProjectConfigContractModel,
  buildProjectWorkflowReadoutModel,
  buildProjectSurfaceModel,
  formatProjectSurfaceTimestamp,
  formatProjectSurfaceCount,
  listProjectUiKitOptions,
  resolveProjectComponentStatusLabel,
  resolveProjectComponentWorkflowLabel,
  sortProjectsForSurface,
}

export type {
  ProjectConfigContractModel,
  ProjectSurfaceModel,
  ProjectUiKitOption,
} from "./projectSurfaceShared"

export type {
  ProjectComponentSurfaceModel,
  ProjectHistoryDiagnosticsModel,
  ProjectWorkflowReadoutModel,
} from "./projectSurfaceShared"
