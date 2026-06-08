export type PerformanceBudgetVerdictStatus = "ok" | "regression" | "budget-exceeded"

export type PerformanceBudgetVerdict = {
  scenario: string
  status: PerformanceBudgetVerdictStatus
  baselineMs: number
  budgetMs: number
  noiseThresholdMs: number
  regressionThresholdMs: number
  representativeDurationMs: number
  slowestSampleMs: number
  sampleCount: number
  regressionDeltaMs: number
  budgetDeltaMs: number
}

export type PerformanceBudgetInput = {
  scenario: string
  samplesMs: number[]
  baselineMs: number
  budgetMs: number
  noiseThresholdMs?: number
}

function assertFinitePositive(name: string, value: number) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} должен быть конечным числом не меньше 0`)
  }
}

function toSortedSamples(samplesMs: number[]) {
  if (samplesMs.length === 0) {
    throw new Error("Нужен хотя бы один controlled sample для performance verdict")
  }

  const sorted = [...samplesMs]

  for (const sample of sorted) {
    assertFinitePositive("samplesMs", sample)
  }

  sorted.sort((left, right) => left - right)
  return sorted
}

function calculateMedian(sortedSamples: number[]) {
  const middleIndex = Math.floor(sortedSamples.length / 2)

  if (sortedSamples.length % 2 === 1) {
    return sortedSamples[middleIndex] ?? 0
  }

  return ((sortedSamples[middleIndex - 1] ?? 0) + (sortedSamples[middleIndex] ?? 0)) / 2
}

export function createPerformanceBudgetVerdict(input: PerformanceBudgetInput): PerformanceBudgetVerdict {
  const noiseThresholdMs = input.noiseThresholdMs ?? 0
  const sortedSamples = toSortedSamples(input.samplesMs)

  assertFinitePositive("baselineMs", input.baselineMs)
  assertFinitePositive("budgetMs", input.budgetMs)
  assertFinitePositive("noiseThresholdMs", noiseThresholdMs)

  if (input.budgetMs < input.baselineMs) {
    throw new Error("budgetMs не может быть меньше baselineMs")
  }

  const representativeDurationMs = calculateMedian(sortedSamples)
  const slowestSampleMs = sortedSamples[sortedSamples.length - 1] ?? representativeDurationMs
  const regressionThresholdMs = input.baselineMs + noiseThresholdMs
  const regressionDeltaMs = representativeDurationMs - regressionThresholdMs
  const budgetDeltaMs = representativeDurationMs - input.budgetMs

  let status: PerformanceBudgetVerdictStatus = "ok"

  if (representativeDurationMs > input.budgetMs) {
    status = "budget-exceeded"
  } else if (representativeDurationMs > regressionThresholdMs) {
    status = "regression"
  }

  return {
    scenario: input.scenario,
    status,
    baselineMs: input.baselineMs,
    budgetMs: input.budgetMs,
    noiseThresholdMs,
    regressionThresholdMs,
    representativeDurationMs,
    slowestSampleMs,
    sampleCount: sortedSamples.length,
    regressionDeltaMs,
    budgetDeltaMs,
  }
}
