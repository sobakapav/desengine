import {
  attachRuntimeDiagnostics,
  createRuntimeDiagnosticsRecord,
  emitRuntimeDiagnostics,
} from "@/lib/task/runtime-observability"

type TaskMutation<T> = () => T | Promise<T>

const taskMutationTails = new Map<string, Promise<void>>()

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
  const pendingBeforeEnqueue = getPendingTaskMutationCount()
  const previousTail = taskMutationTails.get(taskId) ?? Promise.resolve()
  const queuedForTask = taskMutationTails.has(taskId)

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
            pendingAfterEnqueue: taskMutationTails.size,
            queuedForTask,
            queueWaitMs,
            activeTaskMutations: taskMutationTails.size,
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
            pendingAfterEnqueue: taskMutationTails.size,
            queuedForTask,
            queueWaitMs,
            activeTaskMutations: taskMutationTails.size,
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
    if (taskMutationTails.get(taskId) === nextTail) {
      taskMutationTails.delete(taskId)
    }
  })

  return result
}

export function getPendingTaskMutationCount() {
  return taskMutationTails.size
}
