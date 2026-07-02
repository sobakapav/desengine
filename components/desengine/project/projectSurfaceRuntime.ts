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
      return "Компонент внутри проектного workflow"
    default:
      return component.workflowKind
  }
}

function resolveProjectComponentStatusLabel(status: ProjectComponent["status"]) {
  switch (status) {
    case "in_progress":
      return "В активной работе проекта"
    case "completed":
      return "Готов внутри проекта"
    default:
      return "Ещё не включён в работу"
  }
}

function resolveWorkflowStageStatusLabel(status: ProjectWorkflowReadoutSnapshot["entries"][number]["stageStatus"]) {
  switch (status) {
    case "completed":
      return "Этап завершён"
    case "in_progress":
      return "Этап в работе"
    default:
      return "Этап ещё не начат"
  }
}

function resolveProjectHistoryEventKindLabel(kind: ProjectHistoryDiagnosticsSnapshot["events"][number]["kind"]) {
  switch (kind) {
    case "project-session-started":
      return "Старт project-work"
    case "project-component-created":
      return "Добавлен компонент"
    case "project-focus-set":
      return "Сменился фокус проекта"
    case "project-focus-cleared":
      return "Фокус снят"
    case "project-component-completed":
      return "Компонент завершён"
    case "project-component-reopened":
      return "Компонент возвращён в работу"
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
  const focusStatusLabel = workflowEntry?.isFocused
    ? "Текущий фокус проекта"
    : workflowEntry
      ? "Компонент уже присутствует в проектной работе"
      : null

  return {
    id: component.id,
    title: component.title,
    workflowLabel: resolveProjectComponentWorkflowLabel(component),
    statusLabel: resolveProjectComponentStatusLabel(component.status),
    sessionStatusLabel: focusStatusLabel
      ? focusStatusLabel
      : component.status !== "draft"
        ? "Компонент уже присутствует в проектной работе"
        : "Компонент ещё не включён в активную работу проекта",
    sessionActionLabel: workflowEntry?.isFocused
      ? "Текущий фокус проекта"
      : component.status === "completed"
        ? "Вернуть в фокус проекта"
        : "Сделать фокусом проекта",
    workflowProgressLabel: workflowEntry
      ? workflowEntry.stageTitle
      : component.status !== "draft"
        ? "Компонент уже входит в рабочий контур проекта"
        : "Проект ещё не выбрал этот компонент как явный фокус",
    activeWorkflowPointLabel: workflowEntry?.isFocused
      ? "Сейчас проект работает через этот компонент"
      : workflowEntry
        ? "Компонент можно снова сделать активным фокусом проекта"
        : component.status !== "draft"
          ? "Компонент можно снова сделать активным фокусом проекта"
          : "Работа через этот компонент начнётся после выбора фокуса",
    lastActivityLabel: workflowEntry?.lastActivityAt
      ? formatProjectSurfaceTimestamp(workflowEntry.lastActivityAt)
      : component.status !== "draft"
        ? formatProjectSurfaceTimestamp(component.updatedAt)
        : "Активность по компоненту ещё не зафиксирована",
    completeActionLabel: component.status === "completed"
      ? "Вернуть в активную работу"
      : "Отметить как готовый",
    createdAtLabel: formatProjectSurfaceTimestamp(component.createdAt),
    updatedAtLabel: formatProjectSurfaceTimestamp(component.updatedAt),
  }
}

function buildProjectHistoryDiagnosticsModel(snapshot: ProjectHistoryDiagnosticsSnapshot): ProjectHistoryDiagnosticsModel {
  return {
    summary: {
      eventCountLabel: formatProjectSurfaceCount(snapshot.summary.eventCount, "событие", "события", "событий"),
      focusChangeCountLabel: formatProjectSurfaceCount(snapshot.summary.focusChangeCount, "смена фокуса", "смены фокуса", "смен фокуса"),
      createdComponentCountLabel: formatProjectSurfaceCount(snapshot.summary.createdComponentCount, "созданный компонент", "созданных компонента", "созданных компонентов"),
      completedComponentCountLabel: formatProjectSurfaceCount(snapshot.summary.completedComponentCount, "готовый компонент", "готовых компонента", "готовых компонентов"),
      lastActivityLabel: snapshot.summary.lastActivityAt
        ? formatProjectSurfaceTimestamp(snapshot.summary.lastActivityAt)
        : "След активности пока не проявлен",
    },
    events: snapshot.events.map((event) => ({
      id: event.id,
      createdAtLabel: formatProjectSurfaceTimestamp(event.createdAt),
      componentLabel: event.componentTitle ? `Компонент: ${event.componentTitle}` : "Событие уровня проекта",
      kindLabel: resolveProjectHistoryEventKindLabel(event.kind),
      message: event.message,
    })),
  }
}

function buildProjectWorkflowReadoutModel(snapshot: ProjectWorkflowReadoutSnapshot): ProjectWorkflowReadoutModel {
  const focusedCount = snapshot.entries.filter((entry) => entry.isFocused).length
  const completedCount = snapshot.entries.filter((entry) => entry.componentStatus === "completed").length

  return {
    summary: {
      componentCountLabel: formatProjectSurfaceCount(snapshot.entries.length, "компонент", "компонента", "компонентов"),
      focusedCountLabel: formatProjectSurfaceCount(focusedCount, "фокус", "фокуса", "фокусов"),
      completedCountLabel: formatProjectSurfaceCount(completedCount, "готовый компонент", "готовых компонента", "готовых компонентов"),
      stageCountLabel: formatProjectSurfaceCount(snapshot.stages.length, "этап", "этапа", "этапов"),
    },
    entries: snapshot.entries.map((entry) => ({
      componentId: entry.componentId,
      componentTitle: entry.componentTitle,
      componentStatusLabel: resolveProjectComponentStatusLabel(entry.componentStatus),
      focusLabel: entry.isFocused ? "Текущий фокус проекта" : "Не является текущим фокусом",
      stageTitle: entry.stageTitle,
      stageStatusLabel: resolveWorkflowStageStatusLabel(entry.stageStatus),
      lastActivityLabel: entry.lastActivityAt
        ? formatProjectSurfaceTimestamp(entry.lastActivityAt)
        : "Активность ещё не зафиксирована",
      noteLabels: entry.notes,
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
