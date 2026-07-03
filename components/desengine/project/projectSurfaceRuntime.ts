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
      return "Шаг завершён"
    case "in_progress":
      return "Шаг в работе"
    default:
      return "Шаг ещё не начат"
  }
}

function resolveProjectHistoryEventKindLabel(kind: ProjectHistoryDiagnosticsSnapshot["events"][number]["kind"]) {
  switch (kind) {
    case "project-session-started":
      return "Старт project-work"
    case "project-component-created":
      return "Добавлен компонент"
    case "project-component-started":
      return "Компонент взят в работу"
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

  return {
    id: component.id,
    title: component.title,
    workflowLabel: resolveProjectComponentWorkflowLabel(component),
    statusLabel: resolveProjectComponentStatusLabel(component.status),
    sessionStatusLabel: component.status !== "draft"
      ? "Компонент уже присутствует в проектной работе"
      : "Компонент ещё не включён в активную работу проекта",
    sessionActionLabel: component.status === "completed"
      ? "Вернуть в работу"
      : component.status === "in_progress"
        ? "Компонент уже в работе"
        : "Взять в работу",
    workflowProgressLabel: workflowEntry
      ? workflowEntry.stageTitle
      : component.status !== "draft"
        ? "Компонент уже входит в рабочий контур проекта"
        : "Рабочая линия по этому компоненту ещё не запущена",
    activeWorkflowPointLabel: component.status === "in_progress"
      ? "Проект ведёт активную работу по этому компоненту"
      : component.status === "completed"
        ? "Компонент уже встроен в текущую проектную систему"
        : "Работа через этот компонент начнётся после запуска линии",
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
      startedComponentCountLabel: formatProjectSurfaceCount(snapshot.summary.startedComponentCount, "запущенная линия", "запущенные линии", "запущенных линий"),
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
  const inProgressCount = snapshot.entries.filter((entry) => entry.componentStatus === "in_progress").length
  const completedCount = snapshot.entries.filter((entry) => entry.componentStatus === "completed").length

  return {
    summary: {
      componentCountLabel: formatProjectSurfaceCount(snapshot.entries.length, "компонент", "компонента", "компонентов"),
      inProgressCountLabel: formatProjectSurfaceCount(inProgressCount, "линия в работе", "линии в работе", "линий в работе"),
      completedCountLabel: formatProjectSurfaceCount(completedCount, "готовый компонент", "готовых компонента", "готовых компонентов"),
      stageCountLabel: formatProjectSurfaceCount(snapshot.stages.length, "шаг workflow", "шага workflow", "шагов workflow"),
    },
    entries: snapshot.entries.map((entry) => ({
      componentId: entry.componentId,
      componentTitle: entry.componentTitle,
      componentStatusLabel: resolveProjectComponentStatusLabel(entry.componentStatus),
      workstreamLabel: entry.componentStatus === "in_progress"
        ? "По компоненту идёт активная линия работы"
        : entry.componentStatus === "completed"
          ? "Компонент уже собран в проектный слой"
          : "Линия работы по компоненту ещё не стартовала",
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
