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
  const previousTail = taskMutationTails.get(taskId) ?? Promise.resolve()

  const result = previousTail
    .catch(() => undefined)
    .then(() => mutation())
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
