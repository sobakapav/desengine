import {
  createWorkflowStepEventScope,
  type EventEnvelope,
} from "@/lib/system/events"

type LabTaskScreenEventInput = {
  taskId: string
  activeScreen: string
}

type LabTaskScreenEventPayload = {
  family: "experience"
  action: "lab-task-screen-active-screen-changed"
  activeScreen: string
}

type LabTaskScreenEventScope = {
  projectId: string
  taskId: string
  workflowStepId: string
  workbenchInstanceId?: never
}

type LabTaskScreenEvent = EventEnvelope<LabTaskScreenEventPayload> & {
  kind: "experience.lab-task-screen.active-screen.changed"
  scope: LabTaskScreenEventScope
}

function createLabTaskScreenEventInput(taskId: string, activeScreen: string): LabTaskScreenEventInput {
  return { taskId, activeScreen }
}

function syncLabTaskScreenEventInput(args: {
  activeScreen: string
  fallbackTaskId: string
  input?: LabTaskScreenEventInput | null
}): LabTaskScreenEventInput {
  return {
    taskId: args.fallbackTaskId || args.input?.taskId || "",
    activeScreen: args.activeScreen,
  }
}

function changeLabTaskScreenEventInput(input: LabTaskScreenEventInput, activeScreen: string): LabTaskScreenEventInput {
  return createLabTaskScreenEventInput(input.taskId, activeScreen)
}

function buildLabTaskScreenEvent(args: {
  input: LabTaskScreenEventInput
  levelNumber: number
  occurredAt?: string
}): LabTaskScreenEvent {
  const workflowStepId = `workflow-step:${args.input.taskId}:level-lab:${args.levelNumber}`

  return {
    eventId: `event:${workflowStepId}:screen:${args.input.activeScreen}`,
    kind: "experience.lab-task-screen.active-screen.changed",
    occurredAt: args.occurredAt ?? new Date().toISOString(),
    scope: createWorkflowStepEventScope(`task-${args.input.taskId}`, args.input.taskId, workflowStepId),
    privacyClass: "local",
    redactionState: "metadata-only",
    payload: {
      family: "experience",
      action: "lab-task-screen-active-screen-changed",
      activeScreen: args.input.activeScreen,
    },
  }
}

function readLabTaskScreenEventActiveScreen(event: LabTaskScreenEvent): string {
  return event.payload.activeScreen
}

export {
  buildLabTaskScreenEvent,
  changeLabTaskScreenEventInput,
  createLabTaskScreenEventInput,
  readLabTaskScreenEventActiveScreen,
  syncLabTaskScreenEventInput,
  type LabTaskScreenEvent,
  type LabTaskScreenEventInput,
}
