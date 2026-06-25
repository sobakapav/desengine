import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import { PROJECT_STORAGE_LABEL } from "./projectStorageLabels"

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
    taskCountLabel: string
    promptCountLabel: string
    checkResultCountLabel: string
    resetSnapshotCountLabel: string
    runtimeFileCountLabel: string
    lastActivityLabel: string
  }
  prompts: Array<{
    taskId: string
    createdAtLabel: string
    levelLabel: string
    textPreview: string
    changedFilesLabel: string
    providerLabel: string
  }>
  checkResults: Array<{
    taskId: string
    createdAtLabel: string
    levelLabel: string
    statusLabel: string
    messagePreview: string
  }>
  resetSnapshots: Array<{
    taskId: string
    levelLabel: string
    editableFilesLabel: string
    capturedFilesLabel: string
  }>
  runtimeContexts: Array<{
    taskId: string
    promptCountLabel: string
    checkResultLabel: string
    resetSnapshotLabel: string
    runtimeFilesLabel: string
    runtimeFilesPreview: string
    lastActivityLabel: string
  }>
}

type ProjectWorkflowReadoutModel = {
  summary: {
    runCountLabel: string
    workflowPointCountLabel: string
    artifactCountLabel: string
    workbenchCountLabel: string
  }
  entries: Array<{
    taskId: string
    taskTitle: string
    runStatusLabel: string
    workflowStepTitle: string
    workflowStepStatusLabel: string
    runProgressLabel: string
    activeWorkflowPointLabel: string
    lastActivityLabel: string
    artifactScopeLabel: string
    artifactKindsLabel: string
    artifactPreviewLabel: string
    workflowPointLabels: string[]
    workbenchLabel: string
    bindingLabel: string
  }>
}

type ProjectComponentSurfaceModel = {
  id: string
  title: string
  taskLabel: string
  workflowLabel: string
  statusLabel: string
  sessionStatusLabel: string
  sessionActionLabel: string
  workflowProgressLabel: string
  activeWorkflowPointLabel: string
  lastActivityLabel: string
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

function resolveProjectUiKitTitle(project: ProjectWorkspace) {
  return sandpackUiKitsConfig[project.settings.uiKitId].title
}

function listProjectUiKitOptions(): ProjectUiKitOption[] {
  return Object.values(sandpackUiKitsConfig).map((kit) => ({
    id: kit.id,
    title: kit.title,
  }))
}

function buildProjectConfigContractModel(project: ProjectWorkspace): ProjectConfigContractModel {
  const selectedUiKit = sandpackUiKitsConfig[project.settings.uiKitId]

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

function resolveProjectComponentWorkflowLabel(component: ProjectComponent) {
  switch (component.workflowKind) {
    case "image-to-component-workflow":
      return "Компонент по картинке"
    default:
      return component.workflowKind
  }
}

function resolveProjectComponentStatusLabel(component: ProjectComponent) {
  switch (component.status) {
    case "in_progress":
      return "В работе"
    case "completed":
      return "Готов"
    default:
      return "Черновик"
  }
}

function buildProjectComponentSurfaceModel(
  component: ProjectComponent,
  options?: {
    taskLabel?: string
    workflowEntry?: ProjectWorkflowReadoutSnapshot["entries"][number] | null
  },
): ProjectComponentSurfaceModel {
  const workflowEntry = options?.workflowEntry ?? null

  return {
    id: component.id,
    title: component.title,
    taskLabel: options?.taskLabel ?? (component.taskId ? component.taskId : "ещё не назначен"),
    workflowLabel: resolveProjectComponentWorkflowLabel(component),
    statusLabel: resolveProjectComponentStatusLabel(component),
    sessionStatusLabel: workflowEntry
      ? resolveWorkflowRunStatusLabel(workflowEntry.runStatus)
      : component.taskId
        ? "Работа уже привязана к компоненту"
        : "Работа ещё не запускалась",
    sessionActionLabel: component.taskId && component.status !== "draft"
      ? "Продолжить работу"
      : "Работать над компонентом",
    workflowProgressLabel: workflowEntry
      ? `Готово ${workflowEntry.completedWorkflowPointCount} из ${workflowEntry.workflowPointCount} шагов работы`
      : component.taskId
        ? "Работа уже привязана к компоненту, но прогресс пока не появился"
        : "Работа ещё не запускалась из этой карточки",
    activeWorkflowPointLabel: workflowEntry?.activeWorkflowPointTitle
      ? `Сейчас: ${workflowEntry.activeWorkflowPointTitle}`
      : workflowEntry
        ? `Текущий этап: ${workflowEntry.workflowStepTitle}`
        : component.taskId
          ? "Текущий шаг пока не определён"
          : "Работа начнётся после первого запуска",
    lastActivityLabel: workflowEntry?.lastActivityAt
      ? formatProjectSurfaceTimestamp(workflowEntry.lastActivityAt)
      : component.taskId
        ? "Последняя активность пока не зафиксирована"
        : "Работа ещё не запускалась",
    createdAtLabel: formatProjectSurfaceTimestamp(component.createdAt),
    updatedAtLabel: formatProjectSurfaceTimestamp(component.updatedAt),
  }
}

function buildProjectHistoryDiagnosticsModel(snapshot: ProjectHistoryDiagnosticsSnapshot): ProjectHistoryDiagnosticsModel {
  return {
    summary: {
      taskCountLabel: formatProjectSurfaceCount(snapshot.summary.taskCount, "задача", "задачи", "задач"),
      promptCountLabel: formatProjectSurfaceCount(snapshot.summary.promptCount, "prompt", "prompt'а", "prompt'ов"),
      checkResultCountLabel: formatProjectSurfaceCount(snapshot.summary.checkResultCount, "check-result", "check-result'а", "check-result'ов"),
      resetSnapshotCountLabel: formatProjectSurfaceCount(snapshot.summary.resetSnapshotCount, "reset snapshot", "reset snapshot'а", "reset snapshot'ов"),
      runtimeFileCountLabel: formatProjectSurfaceCount(snapshot.summary.runtimeFileCount, "runtime-файл", "runtime-файла", "runtime-файлов"),
      lastActivityLabel: snapshot.summary.lastActivityAt
        ? formatProjectSurfaceTimestamp(snapshot.summary.lastActivityAt)
        : "Следа активности пока нет",
    },
    prompts: snapshot.prompts.map((prompt) => ({
      taskId: prompt.taskId,
      createdAtLabel: formatProjectSurfaceTimestamp(prompt.createdAt),
      levelLabel: prompt.levelNumber ? `Уровень ${prompt.levelNumber}` : "Уровень не зафиксирован",
      textPreview: prompt.textPreview,
      changedFilesLabel: prompt.changedFileNames.length > 0
        ? prompt.changedFileNames.join(", ")
        : "Без явного changed-file следа",
      providerLabel: prompt.provider ?? "provider не сохранён",
    })),
    checkResults: snapshot.checkResults.map((checkResult) => ({
      taskId: checkResult.taskId,
      createdAtLabel: formatProjectSurfaceTimestamp(checkResult.createdAt),
      levelLabel: `Уровень ${checkResult.levelNumber}`,
      statusLabel: checkResult.passed ? "Проверка пройдена" : `Проверка завершилась как ${checkResult.kind}`,
      messagePreview: checkResult.messagePreview,
    })),
    resetSnapshots: snapshot.resetSnapshots.map((snapshotItem) => ({
      taskId: snapshotItem.taskId,
      levelLabel: `Уровень ${snapshotItem.levelNumber}`,
      editableFilesLabel: formatProjectSurfaceCount(snapshotItem.editableFileCount, "editable file", "editable file", "editable files"),
      capturedFilesLabel: snapshotItem.capturedFiles.length > 0
        ? snapshotItem.capturedFiles.join(", ")
        : "Снимок сохранён без file-id списка",
    })),
    runtimeContexts: snapshot.runtimeContexts.map((context) => ({
      taskId: context.taskId,
      promptCountLabel: formatProjectSurfaceCount(context.promptCount, "prompt", "prompt'а", "prompt'ов"),
      checkResultLabel: context.hasCheckResult ? "Есть check-result след" : "check-result следа пока нет",
      resetSnapshotLabel: formatProjectSurfaceCount(context.resetSnapshotCount, "reset snapshot", "reset snapshot'а", "reset snapshot'ов"),
      runtimeFilesLabel: formatProjectSurfaceCount(context.runtimeFileCount, "runtime-файл", "runtime-файла", "runtime-файлов"),
      runtimeFilesPreview: context.runtimeFileNames.length > 0
        ? context.runtimeFileNames.join(", ")
        : "Файлы пока не проявлены отдельно от history/meta JSON",
      lastActivityLabel: context.lastActivityAt
        ? formatProjectSurfaceTimestamp(context.lastActivityAt)
        : "Последняя активность ещё не зафиксирована",
    })),
  }
}

function resolveWorkflowStepStatusLabel(status: ProjectWorkflowReadoutSnapshot["entries"][number]["workflowStepStatus"]) {
  switch (status) {
    case "completed":
      return "Этап завершён"
    case "failed":
      return "Этап требует внимания"
    case "in_progress":
      return "Этап в работе"
    default:
      return "Этап ещё не начат"
  }
}

function resolveWorkflowRunStatusLabel(status: ProjectWorkflowReadoutSnapshot["entries"][number]["runStatus"]) {
  switch (status) {
    case "completed":
      return "Работа завершена"
    case "blocked":
      return "Работа требует внимания"
    case "in_progress":
      return "Работа в процессе"
    default:
      return "Работа ещё не начата"
  }
}

function resolveArtifactKindLabel(kind: ProjectWorkflowReadoutSnapshot["entries"][number]["artifactKindSummary"][number]["kind"]) {
  switch (kind) {
    case "code-file":
      return "файлы кода"
    case "prompt-entry":
      return "промпты"
    case "check-result":
      return "проверки"
    case "source-image":
      return "исходные изображения"
    default:
      return kind
  }
}

function buildProjectWorkflowReadoutModel(snapshot: ProjectWorkflowReadoutSnapshot): ProjectWorkflowReadoutModel {
  const artifactCount = snapshot.entries.reduce((total, entry) => total + entry.totalArtifactCount, 0)
  const workbenchCount = snapshot.entries.filter((entry) => entry.workbenchInstanceId).length
  const workflowPointCount = snapshot.entries.reduce((total, entry) => total + entry.workflowPointCount, 0)

  return {
    summary: {
      runCountLabel: formatProjectSurfaceCount(snapshot.entries.length, "работа", "работы", "работ"),
      workflowPointCountLabel: formatProjectSurfaceCount(workflowPointCount, "шаг", "шага", "шагов"),
      artifactCountLabel: formatProjectSurfaceCount(artifactCount, "результат", "результата", "результатов"),
      workbenchCountLabel: formatProjectSurfaceCount(workbenchCount, "рабочая поверхность", "рабочие поверхности", "рабочих поверхностей"),
    },
    entries: snapshot.entries.map((entry) => ({
      taskId: entry.taskId,
      taskTitle: entry.taskTitle,
      runStatusLabel: resolveWorkflowRunStatusLabel(entry.runStatus),
      workflowStepTitle: entry.workflowStepTitle,
      workflowStepStatusLabel: resolveWorkflowStepStatusLabel(entry.workflowStepStatus),
      runProgressLabel: `Готово ${entry.completedWorkflowPointCount} из ${entry.workflowPointCount} шагов работы`,
      activeWorkflowPointLabel: entry.activeWorkflowPointTitle
        ? `Сейчас: ${entry.activeWorkflowPointTitle}`
        : "Текущий шаг ещё не выделился отдельно",
      lastActivityLabel: entry.lastActivityAt
        ? formatProjectSurfaceTimestamp(entry.lastActivityAt)
        : "Последняя активность ещё не зафиксирована",
      artifactScopeLabel: `Входящих: ${entry.inputArtifactCount}, новых: ${entry.outputArtifactCount}`,
      artifactKindsLabel: entry.artifactKindSummary.length > 0
        ? entry.artifactKindSummary.map((artifact) => `${resolveArtifactKindLabel(artifact.kind)}: ${artifact.count}`).join(", ")
        : "Пока нет заметных результатов",
      artifactPreviewLabel: entry.artifactPreview.length > 0
        ? entry.artifactPreview.join(", ")
        : "Предпросмотр результатов пока не виден",
      workflowPointLabels: entry.workflowPoints.map((point) => {
        const statusLabel = resolveWorkflowStepStatusLabel(point.status).replace("Этап ", "")
        return `${point.title} (${statusLabel}, результатов: ${point.outputArtifactCount})`
      }),
      workbenchLabel: entry.workbenchDefinitionTitle
        ? `${entry.workbenchDefinitionTitle}${entry.workbenchInstanceId ? `, id: ${entry.workbenchInstanceId}` : ""}`
        : "Рабочая поверхность пока не определена",
      bindingLabel: `Путь: проект -> задача -> этап «${entry.workflowStepTitle}» -> ${entry.workbenchDefinitionTitle ?? "рабочая поверхность"}`,
    })),
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
  ProjectComponentSurfaceModel,
  ProjectConfigContractModel,
  ProjectHistoryDiagnosticsModel,
  ProjectSurfaceModel,
  ProjectWorkflowReadoutModel,
  ProjectUiKitOption,
}
