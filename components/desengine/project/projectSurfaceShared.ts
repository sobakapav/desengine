import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import type { ProjectWorkspace } from "@/lib/project/runtime"

type ProjectSurfaceModel = {
  id: string
  title: string
  isActive: boolean
  uiKitTitle: string
  storageLabel: string
  createdAtLabel: string
  updatedAtLabel: string
}

type ProjectUiKitOption = {
  id: ProjectWorkspace["settings"]["uiKitId"]
  title: string
}

type ProjectConfigContractModel = {
  selectedUiKitId: ProjectWorkspace["settings"]["uiKitId"]
  selectedUiKitTitle: string
  promptPreviewContractJson: string
}

type ProjectHistoryDiagnosticsModel = {
  summary: {
    eventCountLabel: string
    focusChangeCountLabel: string
    createdComponentCountLabel: string
    completedComponentCountLabel: string
    lastActivityLabel: string
  }
  events: Array<{
    id: string
    createdAtLabel: string
    componentLabel: string
    kindLabel: string
    message: string
  }>
}

type ProjectWorkflowReadoutModel = {
  summary: {
    componentCountLabel: string
    focusedCountLabel: string
    completedCountLabel: string
    stageCountLabel: string
  }
  entries: Array<{
    componentId: string
    componentTitle: string
    componentStatusLabel: string
    focusLabel: string
    stageTitle: string
    stageStatusLabel: string
    lastActivityLabel: string
    noteLabels: string[]
  }>
}

type ProjectComponentSurfaceModel = {
  id: string
  title: string
  workflowLabel: string
  statusLabel: string
  sessionStatusLabel: string
  sessionActionLabel: string
  workflowProgressLabel: string
  activeWorkflowPointLabel: string
  lastActivityLabel: string
  completeActionLabel: string
  createdAtLabel: string
  updatedAtLabel: string
}

function formatProjectSurfaceTimestamp(value: string) {
  const timestamp = new Date(value)

  if (Number.isNaN(timestamp.getTime())) {
    return "недоступно"
  }

  return `${timestamp.toISOString().slice(0, 16).replace("T", " ")} UTC`
}

function formatProjectSurfaceCount(value: number, singular: string, plural: string, genitivePlural: string) {
  const mod10 = value % 10
  const mod100 = value % 100

  let noun = genitivePlural
  if (mod10 === 1 && mod100 !== 11) {
    noun = singular
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    noun = plural
  }

  return `${value} ${noun}`
}

export {
  formatProjectSurfaceCount,
  formatProjectSurfaceTimestamp,
}

export type {
  ProjectComponent,
  ProjectComponentSurfaceModel,
  ProjectConfigContractModel,
  ProjectHistoryDiagnosticsModel,
  ProjectHistoryDiagnosticsSnapshot,
  ProjectSurfaceModel,
  ProjectUiKitOption,
  ProjectWorkflowReadoutModel,
  ProjectWorkflowReadoutSnapshot,
  ProjectWorkspace,
}
