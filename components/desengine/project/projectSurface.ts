import { projectUiKitsConfig } from "@/lib/project/ui-kit-config"
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

function buildProjectConfigContractModel(project: ProjectWorkspace): ProjectConfigContractModel {
  const selectedUiKit = projectUiKitsConfig[project.settings.uiKitId]

  return {
    selectedUiKitId: selectedUiKit.id,
    selectedUiKitTitle: selectedUiKit.title,
    promptPreviewContractJson: JSON.stringify({
      project: {
        uiKitId: project.settings.uiKitId,
        uiKitTitle: selectedUiKit.title,
      },
      promptTemplates: {
        projectFields: [
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

function buildProjectSurfaceModel(project: ProjectWorkspace, isActive: boolean): ProjectSurfaceModel {
  return {
    id: project.id,
    title: project.title,
    isActive,
    uiKitTitle: resolveProjectUiKitTitle(project),
    storageLabel: PROJECT_STORAGE_LABEL,
    createdAtLabel: formatProjectSurfaceTimestamp(project.createdAt),
    updatedAtLabel: formatProjectSurfaceTimestamp(project.updatedAt),
  }
}

function sortProjectsForSurface(projects: ProjectWorkspace[], activeProjectId: string | null) {
  return [...projects].sort((left, right) => {
    if (left.id === activeProjectId && right.id !== activeProjectId) {
      return -1
    }

    if (right.id === activeProjectId && left.id !== activeProjectId) {
      return 1
    }

    return right.updatedAt.localeCompare(left.updatedAt)
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
