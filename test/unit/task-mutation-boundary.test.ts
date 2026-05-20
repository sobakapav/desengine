// @openSpec capability: user-progress
// @openSpec scenarios:
// @openSpec  - "Runtime читает и пишет пользовательский прогресс"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Два действия одновременно меняют одну задачу"
// @openSpec  - "Два действия меняют разные задачи"

import { describe, expect, it } from "vitest"

import {
  getPendingTaskMutationCount,
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

    releaseFirstMutation.resolve()

    await expect(Promise.all([first, second])).resolves.toEqual(["first", "second"])
    expect(events).toEqual(["first:start", "first:end", "second:start"])
    expect(getPendingTaskMutationCount()).toBe(0)
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

    releaseFirstTask.resolve()
    await firstTask

    expect(events).toEqual(["task-a:start", "task-b:start", "task-a:end"])
    expect(getPendingTaskMutationCount()).toBe(0)
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
  })
})
