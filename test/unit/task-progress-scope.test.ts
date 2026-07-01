import { describe, expect, it } from "vitest"

import {
  buildTaskProgressScopeKey,
  parseTaskProgressScopeKey,
} from "../../lib/task/project-runtime-scope"

describe("task progress scope key", () => {
  it("оставляет legacy progress на голом taskId без project context", () => {
    expect(buildTaskProgressScopeKey("task-a")).toBe("task-a")
    expect(buildTaskProgressScopeKey("task-a", "task-task-a")).toBe("task-a")
  })

  it("разводит progress по component-scoped project id", () => {
    const scopeKey = buildTaskProgressScopeKey("task-a", "project-1::component::component-1")

    expect(scopeKey).toBe("task-a::project-1::component::component-1")
    expect(parseTaskProgressScopeKey(scopeKey)).toEqual({
      taskId: "task-a",
      projectId: "project-1::component::component-1",
    })
  })
})
