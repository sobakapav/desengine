import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectSession } from "@/lib/project/workspace-session"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

type ProjectWorkbenchDefinition = {
  id: "project-workbench-shell"
  title: string
  summary: string
}

type ProjectWorkbenchSubject =
  | {
    kind: "project"
    id: string
    title: string
  }
  | {
    kind: "component"
    id: string
    title: string
  }

type ProjectWorkbenchSessionStatus = "locked"

type ProjectWorkbenchSession = {
  id: string
  definitionId: ProjectWorkbenchDefinition["id"]
  projectId: string
  projectTitle: string
  workflowDefinitionId: string
  workflowTitle: string
  status: ProjectWorkbenchSessionStatus
  subject: ProjectWorkbenchSubject
  title: string
  summary: string
  lockReason: string
  linkedComponentId: string | null
  lastActivityAt: string | null
}

const PROJECT_WORKBENCH_DEFINITION = {
  id: "project-workbench-shell",
  title: "Project-aware workbench shell",
  summary: "Верстак принадлежит проекту и показывает связку project, workflow и предмета работы.",
} satisfies ProjectWorkbenchDefinition

function createProjectWorkbenchSessionId(args: {
  projectId: string
  subjectKind: ProjectWorkbenchSubject["kind"]
  subjectId: string
}) {
  return `${args.projectId}--${args.subjectKind}--${args.subjectId}`
}

function resolveComponentWorkflowTitle(component: ProjectComponent) {
  switch (component.workflowKind) {
    case "image-to-component-workflow":
      return "Компонент из изображения или Figma JSON"
    default:
      return "Workflow компонента"
  }
}

function buildProjectWorkbenchSessions(args: {
  components: ProjectComponent[]
  project: ProjectWorkspace
  session: ProjectSession | null
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  const projectSession = {
    id: createProjectWorkbenchSessionId({
      projectId: args.project.id,
      subjectKind: "project",
      subjectId: args.project.id,
    }),
    definitionId: PROJECT_WORKBENCH_DEFINITION.id,
    projectId: args.project.id,
    projectTitle: args.project.title,
    workflowDefinitionId: args.project.settings.workflowTemplateId,
    workflowTitle: "Проектный workflow",
    status: "locked",
    subject: {
      kind: "project",
      id: args.project.id,
      title: args.project.title,
    },
    title: "Проектный верстак",
    summary: "Главная оболочка верстака уже привязана к проекту, но рабочие инструменты пока закрыты.",
    lockReason: "Верстак уже материализован, но прямую работу на нём откроем после стабилизации project structure.",
    linkedComponentId: null,
    lastActivityAt: args.workflowReadout.lastActivityAt,
  } satisfies ProjectWorkbenchSession

  const componentSessions = args.components.map((component) => {
    const workflowEntry = args.workflowReadout.entries.find((entry) => entry.componentId === component.id) ?? null

    return {
      id: createProjectWorkbenchSessionId({
        projectId: args.project.id,
        subjectKind: "component",
        subjectId: component.id,
      }),
      definitionId: PROJECT_WORKBENCH_DEFINITION.id,
      projectId: args.project.id,
      projectTitle: args.project.title,
      workflowDefinitionId: component.workflowKind,
      workflowTitle: resolveComponentWorkflowTitle(component),
      status: "locked",
      subject: {
        kind: "component",
        id: component.id,
        title: component.title,
      },
      title: `Верстак компонента «${component.title}»`,
      summary: component.status === "in_progress"
        ? "Этот верстак уже знает, что компонент находится в активной проектной работе."
        : "Верстак уже привязан к компоненту и его workflow, но пока доступен только для осмотра.",
      lockReason: component.status === "in_progress"
        ? "Сначала стабилизируем project-level маршрут работы; затем откроем действия внутри верстака."
        : "Сеанс верстака подготовлен заранее, чтобы позже открыть работу без смены сущностной модели.",
      linkedComponentId: component.id,
      lastActivityAt: workflowEntry?.lastActivityAt ?? component.updatedAt,
    } satisfies ProjectWorkbenchSession
  })

  return [projectSession, ...componentSessions]
}

function getProjectWorkbenchSession(args: {
  components: ProjectComponent[]
  project: ProjectWorkspace
  session: ProjectSession | null
  sessionId: string
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  return buildProjectWorkbenchSessions(args).find((workbenchSession) => workbenchSession.id === args.sessionId) ?? null
}

export {
  PROJECT_WORKBENCH_DEFINITION,
  buildProjectWorkbenchSessions,
  createProjectWorkbenchSessionId,
  getProjectWorkbenchSession,
}

export type {
  ProjectWorkbenchDefinition,
  ProjectWorkbenchSession,
  ProjectWorkbenchSessionStatus,
  ProjectWorkbenchSubject,
}
