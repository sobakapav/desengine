import {
  formatProjectSurfaceCount,
  formatProjectSurfaceTimestamp,
  type ProjectComponent,
  type ProjectComponentSurfaceModel,
  type ProjectHistoryDiagnosticsModel,
  type ProjectHistoryDiagnosticsSnapshot,
  type ProjectWorkflowReadoutModel,
  type ProjectWorkflowReadoutSnapshot,
} from "./projectSurfaceShared"

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

function buildProjectComponentSurfaceModel(
  component: ProjectComponent,
  options?: {
    workflowEntry?: ProjectWorkflowReadoutSnapshot["entries"][number] | null
  },
): ProjectComponentSurfaceModel {
  const workflowEntry = options?.workflowEntry ?? null

  return {
    id: component.id,
    title: component.title,
    workflowLabel: resolveProjectComponentWorkflowLabel(component),
    statusLabel: resolveProjectComponentStatusLabel(component),
    sessionStatusLabel: workflowEntry
      ? resolveWorkflowRunStatusLabel(workflowEntry.runStatus)
      : component.status !== "draft"
        ? "Работа уже открывалась для этого компонента"
        : "Работа ещё не запускалась",
    sessionActionLabel: component.status !== "draft"
      ? "Продолжить работу"
      : "Работать над компонентом",
    workflowProgressLabel: workflowEntry
      ? `Готово ${workflowEntry.completedWorkflowPointCount} из ${workflowEntry.workflowPointCount} шагов работы`
      : component.status !== "draft"
        ? "Работа уже открывалась, но прогресс пока не проявился"
        : "Работа ещё не запускалась из этой карточки",
    activeWorkflowPointLabel: workflowEntry?.activeWorkflowPointTitle
      ? `Сейчас: ${workflowEntry.activeWorkflowPointTitle}`
      : workflowEntry
        ? `Текущий этап: ${workflowEntry.workflowStepTitle}`
        : component.status !== "draft"
          ? "Текущий шаг пока не определён"
          : "Работа начнётся после первого запуска",
    lastActivityLabel: workflowEntry?.lastActivityAt
      ? formatProjectSurfaceTimestamp(workflowEntry.lastActivityAt)
      : component.status !== "draft"
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

export {
  buildProjectComponentSurfaceModel,
  buildProjectHistoryDiagnosticsModel,
  buildProjectWorkflowReadoutModel,
  resolveProjectComponentStatusLabel,
  resolveProjectComponentWorkflowLabel,
}
