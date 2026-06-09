// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Reusable harness прогоняет cold/warm speed-path"
// @openSpec  - "Reusable harness прогоняет repeated preview rebuild"
// @openSpec  - "Reusable harness прогоняет repeated iterate/check path"
// @openSpec  - "Reusable harness прогоняет overload backlog path"
// @openSpec  - "Reusable harness прогоняет oversized payload/output refusal"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Runtime boundary помечает очередь мутаций как degradation signal"
// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Preview payload build возвращает cache и size diagnostics"

import { beforeEach, describe, expect, it, vi } from "vitest"

import { buildSandpackPreviewPayload } from "@/lib/lab/sandpack-preview"
import { runTaskMutation } from "@/lib/task/mutation-boundary"
import type { RuntimeDiagnosticsRecord } from "@/lib/task/runtime-observability"
import {
  expectBoundedRefusalResponse,
  getSamplePrimaryDiagnostic,
  runSpeedLoadHarnessScenario,
} from "../helpers/speed-load-harness"
import { createJsonRequest, readJsonResponse } from "./helpers/route-harness"
import {
  badgeSource,
  readRepositoryShadcnSourceFiles,
  utilsSource,
} from "../unit/sandpack-preview.helpers"

const mocks = vi.hoisted(() => ({
  checkTaskLevel: vi.fn(),
  iterateTaskLevel: vi.fn(),
  normalizeProject: vi.fn(),
  requireAccessOrUnauthorizedResponse: vi.fn(),
}))

vi.mock("@/lib/auth/server", () => ({
  requireAccessOrUnauthorizedResponse: mocks.requireAccessOrUnauthorizedResponse,
}))

vi.mock("@/lib/project/runtime", async () => {
  const actual = await vi.importActual<typeof import("@/lib/project/runtime")>("@/lib/project/runtime")

  return {
    ...actual,
    normalizeProject: mocks.normalizeProject,
  }
})

vi.mock("@/lib/task/actions", async () => {
  const actual = await vi.importActual<typeof import("@/lib/task/actions")>("@/lib/task/actions")

  return {
    ...actual,
    checkTaskLevel: mocks.checkTaskLevel,
    iterateTaskLevel: mocks.iterateTaskLevel,
  }
})

import { POST as postCheck } from "@/app/api/tasks/[taskId]/check/route"
import { POST as postIterate } from "@/app/api/tasks/[taskId]/iterate/route"

function createTaskDiagnostic(
  path: string,
  stage: string,
  durationMs: number,
  options?: {
    status?: RuntimeDiagnosticsRecord["status"]
    taskId?: string
    load?: RuntimeDiagnosticsRecord["load"]
    size?: RuntimeDiagnosticsRecord["size"]
    degradation?: RuntimeDiagnosticsRecord["degradation"]
  },
): RuntimeDiagnosticsRecord {
  return {
    scope: "task",
    path,
    stage,
    status: options?.status ?? "ok",
    durationMs,
    timestamp: "2026-06-08T10:00:00.000Z",
    taskId: options?.taskId ?? "task-speed",
    load: options?.load,
    size: options?.size,
    degradation: options?.degradation,
  }
}

describe("speed/load regression harness integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAccessOrUnauthorizedResponse.mockResolvedValue(null)
    mocks.normalizeProject.mockImplementation((project: Record<string, unknown>) => project)
  })

  it("держит reusable harness для cold/warm preview и repeated rebuild без machine-dependent budget", async () => {
    const previewScenario = await runSpeedLoadHarnessScenario({
      id: "preview-cold-warm",
      baselineMs: 32,
      budgetMs: 40,
      noiseThresholdMs: 8,
      createContext: async () => ({
        sourceFiles: {
          component: `import { Badge } from "@/components/ui/badge";

export default function Component() {
  return <Badge variant="ghost">preview</Badge>;
}
`,
          uiBadge: badgeSource,
          systemUtils: utilsSource,
          ...(await readRepositoryShadcnSourceFiles()),
        },
      }),
      runSample: async (index, context) => {
        const payload = await buildSandpackPreviewPayload(context.sourceFiles, {
          previewSessionId: "preview-cold-warm-shared",
        })
        const diagnostic = payload.runtimeDiagnostics[0]
        const cacheStatus = diagnostic?.load?.cacheStatus

        return {
          label: index === 0 ? "cold-build" : "warm-build",
          controlledDurationMs: cacheStatus === "miss" ? 46 : 18,
          runtimeDiagnostics: payload.runtimeDiagnostics,
        }
      },
    }, 2)

    expect(previewScenario.verdict.status).toBe("ok")

    const coldDiagnostic = getSamplePrimaryDiagnostic(
      previewScenario.samples[0],
      "preview_payload_build",
      "sandpack_preview",
    )
    const warmDiagnostic = getSamplePrimaryDiagnostic(
      previewScenario.samples[1],
      "preview_payload_build",
      "sandpack_preview",
    )

    expect(coldDiagnostic.load).toMatchObject({ cacheStatus: "miss", effectiveUiKitId: "shadcn" })
    expect(warmDiagnostic.load).toMatchObject({ cacheStatus: "hit", effectiveUiKitId: "shadcn" })
    expect(coldDiagnostic.size).toEqual(expect.objectContaining({
      dependencyCount: expect.any(Number),
      sandpackFileCount: expect.any(Number),
    }))

    const repeatedPreviewScenario = await runSpeedLoadHarnessScenario({
      id: "preview-repeated-rebuild",
      baselineMs: 20,
      budgetMs: 30,
      noiseThresholdMs: 4,
      createContext: async () => ({
        sourceFiles: {
          component: `import { Badge } from "@/components/ui/badge";

export default function Component() {
  return <Badge>repeat</Badge>;
}
`,
          uiBadge: badgeSource,
          systemUtils: utilsSource,
          ...(await readRepositoryShadcnSourceFiles()),
        },
      }),
      runSample: async (index, context) => {
        const payload = await buildSandpackPreviewPayload(context.sourceFiles, {
          previewSessionId: "preview-repeated-shared",
        })
        const diagnostic = payload.runtimeDiagnostics[0]
        const cacheStatus = diagnostic?.load?.cacheStatus

        return {
          label: `preview-rebuild-${index + 1}`,
          controlledDurationMs: cacheStatus === "miss" ? 44 : 19 + index,
          runtimeDiagnostics: payload.runtimeDiagnostics,
        }
      },
    }, 3)

    expect(repeatedPreviewScenario.verdict.status).toBe("ok")
    expect(repeatedPreviewScenario.samples.map((sample) => (
      getSamplePrimaryDiagnostic(sample, "preview_payload_build", "sandpack_preview").load?.cacheStatus
    ))).toEqual(["miss", "hit", "hit"])
  })

  it("прогоняет repeated iterate/check path через route boundary и читает единый response contract", async () => {
    mocks.iterateTaskLevel.mockImplementation(async (_taskId: string, prompt: string) => ({
      status: 200,
      body: {
        ok: true,
        prompt,
        runtimeDiagnostics: [createTaskDiagnostic("iterate", "task_iterate", 12, {
          load: { promptImageCount: 1, editableFileCount: 2 },
          size: { promptTextChars: prompt.length, changedFileCount: 1 },
        })],
      },
    }))
    mocks.checkTaskLevel.mockImplementation(async () => ({
      status: 200,
      body: {
        ok: true,
        runtimeDiagnostics: [createTaskDiagnostic("check", "task_check", 11, {
          load: { promptImageCount: 1, editableFileCount: 2 },
          size: { promptContextChars: 420 },
        })],
      },
    }))

    const iterateScenario = await runSpeedLoadHarnessScenario({
      id: "iterate-repeated",
      baselineMs: 10,
      budgetMs: 18,
      noiseThresholdMs: 3,
      runSample: async (index) => {
        const response = await postIterate(
          createJsonRequest({
            body: { prompt: `  Сделай вариант ${index + 1}  ` },
            method: "POST",
            url: "http://localhost/api/tasks/task-speed/iterate",
          }),
          { params: Promise.resolve({ taskId: "task-speed" }) },
        )
        const body = await readJsonResponse<Record<string, unknown>>(response)

        return {
          label: `iterate-${index + 1}`,
          controlledDurationMs: 12 + index,
          runtimeDiagnostics: body.runtimeDiagnostics as RuntimeDiagnosticsRecord[],
          response: { status: response.status, body },
        }
      },
    }, 3)

    expect(iterateScenario.verdict.status).toBe("ok")
    expect(mocks.iterateTaskLevel).toHaveBeenNthCalledWith(1, "task-speed", "Сделай вариант 1")
    expect(mocks.iterateTaskLevel).toHaveBeenNthCalledWith(3, "task-speed", "Сделай вариант 3")

    const checkScenario = await runSpeedLoadHarnessScenario({
      id: "check-repeated",
      baselineMs: 10,
      budgetMs: 18,
      noiseThresholdMs: 3,
      runSample: async (index) => {
        const response = await postCheck(
          createJsonRequest({
            body: { project: { id: `project-${index}`, title: `Проект ${index}` } },
            method: "POST",
            url: "http://localhost/api/tasks/task-speed/check",
          }),
          { params: Promise.resolve({ taskId: "task-speed" }) },
        )
        const body = await readJsonResponse<Record<string, unknown>>(response)

        return {
          label: `check-${index + 1}`,
          controlledDurationMs: 11 + index,
          runtimeDiagnostics: body.runtimeDiagnostics as RuntimeDiagnosticsRecord[],
          response: { status: response.status, body },
        }
      },
    }, 2)

    expect(checkScenario.verdict.status).toBe("ok")
    expect(iterateScenario.samples.every((sample) => sample.response?.status === 200)).toBe(true)
    expect(checkScenario.samples.every((sample) => sample.response?.status === 200)).toBe(true)
    expect(getSamplePrimaryDiagnostic(iterateScenario.samples[0], "iterate", "task_iterate").size).toMatchObject({
      promptTextChars: "Сделай вариант 1".length,
    })
    expect(getSamplePrimaryDiagnostic(checkScenario.samples[0], "check", "task_check").load).toMatchObject({
      promptImageCount: 1,
      editableFileCount: 2,
    })
  })

  it("покрывает overload backlog path через реальный mutation boundary", async () => {
    const dateNowSpy = vi.spyOn(Date, "now")
    const nowValues = [0, 0, 1, 20, 25, 30]
    dateNowSpy.mockImplementation(() => nowValues.shift() ?? 30)

    let releaseFirstMutation: (() => void) | null = null
    const firstGate = new Promise<void>((resolve) => {
      releaseFirstMutation = resolve
    })

    const firstResultPromise = runTaskMutation("task-overload", async () => {
      await firstGate
      return { body: { ok: true, branch: "first" } }
    })

    await Promise.resolve()

    const secondResultPromise = runTaskMutation("task-overload", async () => (
      { body: { ok: true, branch: "second" } }
    ))

    releaseFirstMutation?.()

    const [firstResult, secondResult] = await Promise.all([firstResultPromise, secondResultPromise])
    dateNowSpy.mockRestore()

    const overloadScenario = await runSpeedLoadHarnessScenario({
      id: "task-overload-backlog",
      baselineMs: 12,
      budgetMs: 28,
      noiseThresholdMs: 2,
      createContext: () => ({ results: [firstResult, secondResult] }),
      runSample: async (index, context) => {
        const body = context.results[index]?.body as Record<string, unknown>

        return {
          label: index === 0 ? "immediate" : "queued",
          controlledDurationMs: index === 0 ? 12 : 36,
          runtimeDiagnostics: body.runtimeDiagnostics as RuntimeDiagnosticsRecord[],
          response: { body },
        }
      },
    }, 2)

    expect(overloadScenario.verdict.status).toBe("regression")

    const immediateDiagnostic = getSamplePrimaryDiagnostic(
      overloadScenario.samples[0],
      "mutation_boundary",
      "task_mutation",
    )
    const queuedDiagnostic = getSamplePrimaryDiagnostic(
      overloadScenario.samples[1],
      "mutation_boundary",
      "task_mutation",
    )

    expect(immediateDiagnostic.status).toBe("degraded")
    expect(immediateDiagnostic.load).toMatchObject({ queuedForTask: false })
    expect(immediateDiagnostic.degradation).toMatchObject({ reason: "queued_by_task_boundary" })
    expect(queuedDiagnostic.status).toBe("degraded")
    expect((queuedDiagnostic.load?.queueWaitMs as number)).toBeGreaterThan(
      (immediateDiagnostic.load?.queueWaitMs as number),
    )
    expect(queuedDiagnostic.load).toMatchObject({ queuedForTask: true })
    expect(queuedDiagnostic.degradation).toMatchObject({ reason: "queued_by_task_boundary" })
  })

  it("держит oversized payload/output refusal на fixture/stub runtime без live credentials", async () => {
    const oversizeScenario = await runSpeedLoadHarnessScenario({
      id: "oversized-payload-output-refusal",
      baselineMs: 8,
      budgetMs: 16,
      noiseThresholdMs: 2,
      runSample: async (index) => {
        if (index === 0) {
          return {
            label: "payload-too-large",
            controlledDurationMs: 9,
            runtimeDiagnostics: [createTaskDiagnostic("iterate", "task_iterate", 9, {
              status: "error",
              size: { promptTextChars: 12_500, promptBudgetChars: 8_000 },
              degradation: {
                reason: "oversized_payload_refusal",
                details: { budgetKind: "instruction" },
              },
            })],
            response: {
              status: 413,
              body: { ok: false, error: "Уточняющий запрос слишком большой для безопасной обработки." },
            },
          }
        }

        return {
          label: "output-too-large",
          controlledDurationMs: 10,
          runtimeDiagnostics: [createTaskDiagnostic("check", "task_check", 10, {
            status: "error",
            size: { outputChars: 24_000, outputBudgetChars: 12_000 },
            degradation: {
              reason: "oversized_output_refusal",
              details: { budgetKind: "structured_output" },
            },
          })],
          response: {
            status: 413,
            body: { ok: false, error: "Ответ модели превышает разрешённый budget и не был применён." },
          },
        }
      },
    }, 2)

    expect(oversizeScenario.verdict.status).toBe("ok")
    for (const sample of oversizeScenario.samples) {
      expectBoundedRefusalResponse(sample, 413)
      expect(getSamplePrimaryDiagnostic(
        sample,
        sample.label === "payload-too-large" ? "iterate" : "check",
        sample.label === "payload-too-large" ? "task_iterate" : "task_check",
      ).degradation?.reason).toContain("oversized")
    }
  })
})
