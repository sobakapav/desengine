// @openSpec capability: user-progress
// @openSpec scenarios:
// @openSpec  - "Runtime читает и пишет пользовательский прогресс"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Два действия одновременно меняют одну задачу"
// @openSpec  - "Два действия меняют разные задачи"
// @openSpec  - "Очередь одной задачи превысила bounded лимит"
// @openSpec  - "Runtime превысил лимит pending mutation contexts"

import { beforeEach, describe, expect, it } from "vitest"

import {
  configureTaskMutationBoundaryForTests,
  getPendingTaskMutationCount,
  getPendingTaskMutationContextCount,
  resetTaskMutationBoundaryForTests,
  runTaskMutation,
} from "@/lib/task/mutation-boundary"

function createDeferred() {
  let resolve!: () => void
  const promise = new Promise<void>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

async function waitForQueueTurn() {
  await Promise.resolve()
  await Promise.resolve()
}

describe("task mutation boundary", () => {
  beforeEach(() => {
    resetTaskMutationBoundaryForTests()
  })

  it("сериализует мутации одного taskId", async () => {
    const releaseFirstMutation = createDeferred()
    const events: string[] = []

    const first = runTaskMutation("task-a", async () => {
      events.push("first:start")
      await releaseFirstMutation.promise
      events.push("first:end")
      return "first"
    })

    const second = runTaskMutation("task-a", async () => {
      events.push("second:start")
      return "second"
    })

    await waitForQueueTurn()

    expect(events).toEqual(["first:start"])
    expect(getPendingTaskMutationCount()).toBe(1)
    expect(getPendingTaskMutationContextCount()).toBe(2)

    releaseFirstMutation.resolve()

    await expect(Promise.all([first, second])).resolves.toEqual(["first", "second"])
    expect(events).toEqual(["first:start", "first:end", "second:start"])
    expect(getPendingTaskMutationCount()).toBe(0)
    expect(getPendingTaskMutationContextCount()).toBe(0)
  })

  it("не блокирует мутации разных taskId общей очередью", async () => {
    const releaseFirstTask = createDeferred()
    const events: string[] = []

    const firstTask = runTaskMutation("task-a", async () => {
      events.push("task-a:start")
      await releaseFirstTask.promise
      events.push("task-a:end")
    })

    const secondTask = runTaskMutation("task-b", async () => {
      events.push("task-b:start")
    })

    await waitForQueueTurn()

    expect(events).toEqual(["task-a:start", "task-b:start"])
    await secondTask
    expect(getPendingTaskMutationCount()).toBe(1)
    expect(getPendingTaskMutationContextCount()).toBe(1)

    releaseFirstTask.resolve()
    await firstTask

    expect(events).toEqual(["task-a:start", "task-b:start", "task-a:end"])
    expect(getPendingTaskMutationCount()).toBe(0)
    expect(getPendingTaskMutationContextCount()).toBe(0)
  })

  it("не оставляет очередь taskId в сломанном состоянии после ошибки мутации", async () => {
    const events: string[] = []

    const failed = runTaskMutation("task-a", async () => {
      events.push("failed:start")
      throw new Error("write failed")
    })

    const recovered = runTaskMutation("task-a", async () => {
      events.push("recovered:start")
      return "recovered"
    })

    await expect(failed).rejects.toThrow("write failed")
    await expect(recovered).resolves.toBe("recovered")

    expect(events).toEqual(["failed:start", "recovered:start"])
    expect(getPendingTaskMutationCount()).toBe(0)
    expect(getPendingTaskMutationContextCount()).toBe(0)
  })

  it("быстро отказывает, когда backlog одной задачи превышает bounded queue limit", async () => {
    configureTaskMutationBoundaryForTests({ maxQueuePerTask: 0 })

    const releaseFirstMutation = createDeferred()
    const events: string[] = []

    const first = runTaskMutation("task-a", async () => {
      events.push("first:start")
      await releaseFirstMutation.promise
      events.push("first:end")
      return "first"
    })

    await waitForQueueTurn()

    const refused = runTaskMutation("task-a", async () => {
      events.push("refused:start")
      return "refused"
    })

    await expect(refused).rejects.toMatchObject({
      name: "TaskMutationOverloadError",
      taskId: "task-a",
      reason: "per_task_queue_limit",
    })

    expect(events).toEqual(["first:start"])
    expect(getPendingTaskMutationCount()).toBe(1)
    expect(getPendingTaskMutationContextCount()).toBe(1)

    releaseFirstMutation.resolve()
    await expect(first).resolves.toBe("first")

    expect(getPendingTaskMutationCount()).toBe(0)
    expect(getPendingTaskMutationContextCount()).toBe(0)
  })

  it("быстро отказывает, когда runtime исчерпал лимит pending contexts", async () => {
    configureTaskMutationBoundaryForTests({ maxPendingContexts: 2 })

    const releaseFirstTask = createDeferred()
    const releaseSecondTask = createDeferred()
    const events: string[] = []

    const first = runTaskMutation("task-a", async () => {
      events.push("task-a:start")
      await releaseFirstTask.promise
    })
    const second = runTaskMutation("task-b", async () => {
      events.push("task-b:start")
      await releaseSecondTask.promise
    })

    await waitForQueueTurn()

    const refused = runTaskMutation("task-c", async () => {
      events.push("task-c:start")
    })

    await expect(refused).rejects.toMatchObject({
      name: "TaskMutationOverloadError",
      taskId: "task-c",
      reason: "pending_context_limit",
    })

    expect(events).toEqual(["task-a:start", "task-b:start"])
    expect(getPendingTaskMutationCount()).toBe(2)
    expect(getPendingTaskMutationContextCount()).toBe(2)

    releaseFirstTask.resolve()
    releaseSecondTask.resolve()
    await Promise.all([first, second])

    expect(getPendingTaskMutationCount()).toBe(0)
    expect(getPendingTaskMutationContextCount()).toBe(0)
  })
})
