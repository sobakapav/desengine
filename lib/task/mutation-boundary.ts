import {
  attachRuntimeDiagnostics,
  createRuntimeDiagnosticsRecord,
  emitRuntimeDiagnostics,
} from "@/lib/task/runtime-observability"
import type { TaskActionHttpResult } from "@/lib/task/actions/types"

type TaskMutation<T> = () => T | Promise<T>

const taskMutationTails = new Map<string, Promise<void>>()
const taskPendingContextCounts = new Map<string, number>()

const DEFAULT_TASK_MUTATION_MAX_QUEUE_PER_TASK = 2
const DEFAULT_TASK_MUTATION_MAX_PENDING_CONTEXTS = 8
const DEFAULT_TASK_MUTATION_RETRY_AFTER_MS = 1_000

type TaskMutationBoundaryLimits = {
  maxQueuePerTask: number
  maxPendingContexts: number
  retryAfterMs: number
}

let taskMutationBoundaryLimits: TaskMutationBoundaryLimits = {
  maxQueuePerTask: DEFAULT_TASK_MUTATION_MAX_QUEUE_PER_TASK,
  maxPendingContexts: DEFAULT_TASK_MUTATION_MAX_PENDING_CONTEXTS,
  retryAfterMs: DEFAULT_TASK_MUTATION_RETRY_AFTER_MS,
}

let pendingTaskMutationContexts = 0

export type TaskMutationOverloadReason =
  | "per_task_queue_limit"
  | "pending_context_limit"

type TaskMutationOverloadLoad = {
  pendingBeforeEnqueue: number
  pendingAfterEnqueue: number
  pendingForTaskBeforeEnqueue: number
  pendingForTaskAfterEnqueue: number
  queueDepthForTask: number
  queuedForTask: boolean
  activeTaskMutations: number
  pendingTaskMutationContexts: number
  maxQueuePerTask: number
  maxPendingContexts: number
}

function buildTaskMutationOverloadMessage() {
  return "Runtime задачи временно перегружен. Повторите попытку."
}

function getPendingContextsForTask(taskId: string) {
  return taskPendingContextCounts.get(taskId) ?? 0
}

function incrementPendingContextsForTask(taskId: string) {
  taskPendingContextCounts.set(taskId, getPendingContextsForTask(taskId) + 1)
  pendingTaskMutationContexts += 1
}

function decrementPendingContextsForTask(taskId: string) {
  const nextCount = getPendingContextsForTask(taskId) - 1
  if (nextCount > 0) {
    taskPendingContextCounts.set(taskId, nextCount)
  } else {
    taskPendingContextCounts.delete(taskId)
  }

  pendingTaskMutationContexts = Math.max(0, pendingTaskMutationContexts - 1)
}

export class TaskMutationOverloadError extends Error {
  readonly taskId: string
  readonly reason: TaskMutationOverloadReason
  readonly retryAfterMs: number
  readonly diagnostics: ReturnType<typeof createRuntimeDiagnosticsRecord>

  constructor(args: {
    taskId: string
    reason: TaskMutationOverloadReason
    load: TaskMutationOverloadLoad
    retryAfterMs?: number
    message?: string
  }) {
    super(args.message ?? buildTaskMutationOverloadMessage())
    this.name = "TaskMutationOverloadError"
    this.taskId = args.taskId
    this.reason = args.reason
    this.retryAfterMs = args.retryAfterMs ?? DEFAULT_TASK_MUTATION_RETRY_AFTER_MS
    this.diagnostics = createRuntimeDiagnosticsRecord({
      scope: "task",
      path: "mutation_boundary",
      stage: "task_mutation_refused",
      status: "error",
      durationMs: 0,
      taskId: args.taskId,
      load: args.load,
      degradation: {
        reason: "task_mutation_overload",
        details: {
          overloadReason: args.reason,
          retryAfterMs: this.retryAfterMs,
        },
      },
    })
  }
}

export function isTaskMutationOverloadError(error: unknown): error is TaskMutationOverloadError {
  return error instanceof TaskMutationOverloadError
}

export function createTaskMutationOverloadHttpResult(
  error: TaskMutationOverloadError,
  options?: { message?: string },
): TaskActionHttpResult {
  const result: TaskActionHttpResult = {
    status: 503,
    body: {
      ok: false,
      error: options?.message ?? error.message,
      errorKind: "overload",
      retryable: true,
      retryAfterMs: error.retryAfterMs,
    },
  }

  return attachRuntimeDiagnostics(result, [error.diagnostics])
}

function buildOverloadError(
  taskId: string,
  reason: TaskMutationOverloadReason,
  snapshot: Omit<TaskMutationOverloadLoad, "maxQueuePerTask" | "maxPendingContexts">,
) {
  const error = new TaskMutationOverloadError({
    taskId,
    reason,
    load: {
      ...snapshot,
      maxQueuePerTask: taskMutationBoundaryLimits.maxQueuePerTask,
      maxPendingContexts: taskMutationBoundaryLimits.maxPendingContexts,
    },
    retryAfterMs: taskMutationBoundaryLimits.retryAfterMs,
  })

  emitRuntimeDiagnostics(error.diagnostics)
  return error
}

/**
 * @example
 * ```ts
 * await runTaskMutation("task-1", async () => saveSomething())
 * ```
 */
export async function runTaskMutation<T>(
  taskId: string,
  mutation: TaskMutation<T>,
): Promise<T> {
  const enqueuedAt = Date.now()
  const pendingBeforeEnqueue = getPendingTaskMutationContextCount()
  const activeTaskMutations = getPendingTaskMutationCount()
  const pendingForTaskBeforeEnqueue = getPendingContextsForTask(taskId)
  const previousTail = taskMutationTails.get(taskId) ?? Promise.resolve()
  const queuedForTask = taskMutationTails.has(taskId)
  const queueDepthForTask = Math.max(
    0,
    pendingForTaskBeforeEnqueue - (queuedForTask ? 1 : 0),
  )

  if (queuedForTask && queueDepthForTask >= taskMutationBoundaryLimits.maxQueuePerTask) {
    throw buildOverloadError(taskId, "per_task_queue_limit", {
      pendingBeforeEnqueue,
      pendingAfterEnqueue: pendingBeforeEnqueue,
      pendingForTaskBeforeEnqueue,
      pendingForTaskAfterEnqueue: pendingForTaskBeforeEnqueue,
      queueDepthForTask,
      queuedForTask,
      activeTaskMutations,
      pendingTaskMutationContexts: pendingBeforeEnqueue,
    })
  }

  if (pendingBeforeEnqueue >= taskMutationBoundaryLimits.maxPendingContexts) {
    throw buildOverloadError(taskId, "pending_context_limit", {
      pendingBeforeEnqueue,
      pendingAfterEnqueue: pendingBeforeEnqueue,
      pendingForTaskBeforeEnqueue,
      pendingForTaskAfterEnqueue: pendingForTaskBeforeEnqueue,
      queueDepthForTask,
      queuedForTask,
      activeTaskMutations,
      pendingTaskMutationContexts: pendingBeforeEnqueue,
    })
  }

  incrementPendingContextsForTask(taskId)
  const pendingAfterEnqueue = getPendingTaskMutationContextCount()
  const pendingForTaskAfterEnqueue = getPendingContextsForTask(taskId)

  const result = previousTail
    .catch(() => undefined)
    .then(async () => {
      const startedAt = Date.now()
      const queueWaitMs = startedAt - enqueuedAt

      try {
        const mutationResult = await mutation()
        const diagnostics = createRuntimeDiagnosticsRecord({
          scope: "task",
          path: "mutation_boundary",
          stage: "task_mutation",
          status: queueWaitMs > 0 ? "degraded" : "ok",
          durationMs: Date.now() - enqueuedAt,
          taskId,
          load: {
            pendingBeforeEnqueue,
            pendingAfterEnqueue,
            pendingForTaskBeforeEnqueue,
            pendingForTaskAfterEnqueue,
            queuedForTask,
            queueDepthForTask,
            queueWaitMs,
            activeTaskMutations: taskMutationTails.size,
            pendingTaskMutationContexts: getPendingTaskMutationContextCount(),
          },
          degradation: queueWaitMs > 0
            ? {
                reason: "queued_by_task_boundary",
                details: { taskId },
              }
            : undefined,
        })

        emitRuntimeDiagnostics(diagnostics)
        return attachRuntimeDiagnostics(mutationResult, [diagnostics])
      } catch (error) {
        emitRuntimeDiagnostics(createRuntimeDiagnosticsRecord({
          scope: "task",
          path: "mutation_boundary",
          stage: "task_mutation",
          status: "error",
          durationMs: Date.now() - enqueuedAt,
          taskId,
          load: {
            pendingBeforeEnqueue,
            pendingAfterEnqueue,
            pendingForTaskBeforeEnqueue,
            pendingForTaskAfterEnqueue,
            queuedForTask,
            queueDepthForTask,
            queueWaitMs,
            activeTaskMutations: taskMutationTails.size,
            pendingTaskMutationContexts: getPendingTaskMutationContextCount(),
          },
          degradation: {
            reason: "mutation_failed",
            details: {
              message: error instanceof Error ? error.message : String(error),
            },
          },
        }))
        throw error
      }
    })
  const nextTail = result.then(
    () => undefined,
    () => undefined,
  )

  taskMutationTails.set(taskId, nextTail)

  nextTail.finally(() => {
    decrementPendingContextsForTask(taskId)

    if (taskMutationTails.get(taskId) === nextTail) {
      taskMutationTails.delete(taskId)
    }
  })

  return result
}

export function getPendingTaskMutationCount() {
  return taskMutationTails.size
}

export function getPendingTaskMutationContextCount() {
  return pendingTaskMutationContexts
}

export function configureTaskMutationBoundaryForTests(
  nextLimits: Partial<TaskMutationBoundaryLimits>,
) {
  taskMutationBoundaryLimits = {
    ...taskMutationBoundaryLimits,
    ...nextLimits,
  }
}

export function resetTaskMutationBoundaryForTests() {
  taskMutationTails.clear()
  taskPendingContextCounts.clear()
  pendingTaskMutationContexts = 0
  taskMutationBoundaryLimits = {
    maxQueuePerTask: DEFAULT_TASK_MUTATION_MAX_QUEUE_PER_TASK,
    maxPendingContexts: DEFAULT_TASK_MUTATION_MAX_PENDING_CONTEXTS,
    retryAfterMs: DEFAULT_TASK_MUTATION_RETRY_AFTER_MS,
  }
}
