import { createPerformanceBudgetVerdict } from "./performance-budget"

import type {
  PerformanceBudgetVerdict,
} from "./performance-budget"
import type {
  RuntimeDiagnosticsRecord,
} from "@/lib/task/runtime-observability"

export type SpeedLoadHarnessResponse = {
  status?: number
  body?: Record<string, unknown>
}

export type SpeedLoadHarnessSample = {
  label: string
  controlledDurationMs: number
  runtimeDiagnostics: RuntimeDiagnosticsRecord[]
  response?: SpeedLoadHarnessResponse
}

export type SpeedLoadHarnessRunResult = {
  scenario: string
  verdict: PerformanceBudgetVerdict
  samples: SpeedLoadHarnessSample[]
}

export type SpeedLoadHarnessScenario<TContext = void> = {
  id: string
  baselineMs: number
  budgetMs: number
  noiseThresholdMs?: number
  createContext?: () => Promise<TContext> | TContext
  runSample: (index: number, context: TContext) => Promise<SpeedLoadHarnessSample> | SpeedLoadHarnessSample
}

function assertControlledDuration(sample: SpeedLoadHarnessSample) {
  if (typeof sample.label !== "string" || !sample.label.trim()) {
    throw new Error("Scenario sample должен возвращать непустой label")
  }

  if (!Number.isFinite(sample.controlledDurationMs) || sample.controlledDurationMs < 0) {
    throw new Error(`Scenario sample "${sample.label}" вернул невалидный controlledDurationMs`)
  }

  if (!Array.isArray(sample.runtimeDiagnostics) || sample.runtimeDiagnostics.length === 0) {
    throw new Error(`Scenario sample "${sample.label}" не вернул runtimeDiagnostics contract`)
  }
}

export async function runSpeedLoadHarnessScenario<TContext = void>(
  scenario: SpeedLoadHarnessScenario<TContext>,
  sampleCount: number,
): Promise<SpeedLoadHarnessRunResult> {
  if (!Number.isInteger(sampleCount) || sampleCount <= 0) {
    throw new Error("sampleCount должен быть положительным целым числом")
  }

  const context = scenario.createContext
    ? await scenario.createContext()
    : undefined as TContext
  const samples: SpeedLoadHarnessSample[] = []

  for (let index = 0; index < sampleCount; index += 1) {
    const sample = await scenario.runSample(index, context)
    assertControlledDuration(sample)
    samples.push(sample)
  }

  return {
    scenario: scenario.id,
    samples,
    verdict: createPerformanceBudgetVerdict({
      scenario: scenario.id,
      samplesMs: samples.map((sample) => sample.controlledDurationMs),
      baselineMs: scenario.baselineMs,
      budgetMs: scenario.budgetMs,
      noiseThresholdMs: scenario.noiseThresholdMs,
    }),
  }
}

export function getSamplePrimaryDiagnostic(
  sample: SpeedLoadHarnessSample,
  path: string,
  stage: string,
) {
  const record = sample.runtimeDiagnostics.find((item) => item.path === path && item.stage === stage)

  if (!record) {
    throw new Error(`Scenario sample "${sample.label}" не вернул diagnostics ${path}/${stage}`)
  }

  return record
}

export function expectBoundedRefusalResponse(
  sample: SpeedLoadHarnessSample,
  expectedStatus: number,
) {
  if (!sample.response) {
    throw new Error(`Scenario sample "${sample.label}" не вернул response contract`)
  }

  if (sample.response.status !== expectedStatus) {
    throw new Error(
      `Scenario sample "${sample.label}" вернул status=${sample.response.status ?? "undefined"} вместо ${expectedStatus}`,
    )
  }

  const errorText = sample.response.body?.error
  if (typeof errorText !== "string" || !errorText.trim()) {
    throw new Error(`Scenario sample "${sample.label}" не вернул понятную bounded error diagnostics`)
  }
}
