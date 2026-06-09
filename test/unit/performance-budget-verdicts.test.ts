// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Разработчик проверяет controlled speed-path против performance budget"
// @openSpec  - "Одиночный шумовой spike не считается speed regression"
// @openSpec  - "Добавляется новый behavior-change"

import { describe, expect, it } from "vitest"

import { createPerformanceBudgetVerdict } from "../helpers/performance-budget"

type ScenarioProfile = {
  scenario: string
  samplesMs: number[]
  baselineMs: number
  budgetMs: number
  noiseThresholdMs: number
  expectedStatus: "ok" | "regression" | "budget-exceeded"
}

describe("performance budget verdicts", () => {
  it("различает ok, regression и budget-exceeded для first-wave путей npm run start", () => {
    const profiles: ScenarioProfile[] = [
      {
        scenario: "preview payload build",
        samplesMs: [41, 44, 43],
        baselineMs: 40,
        budgetMs: 55,
        noiseThresholdMs: 5,
        expectedStatus: "ok",
      },
      {
        scenario: "start",
        samplesMs: [78, 81, 84],
        baselineMs: 72,
        budgetMs: 92,
        noiseThresholdMs: 5,
        expectedStatus: "regression",
      },
      {
        scenario: "iterate",
        samplesMs: [69, 71, 70],
        baselineMs: 66,
        budgetMs: 80,
        noiseThresholdMs: 5,
        expectedStatus: "ok",
      },
      {
        scenario: "check",
        samplesMs: [63, 72, 76],
        baselineMs: 61,
        budgetMs: 74,
        noiseThresholdMs: 5,
        expectedStatus: "regression",
      },
      {
        scenario: "lab/task entry path",
        samplesMs: [58, 61, 60],
        baselineMs: 46,
        budgetMs: 56,
        noiseThresholdMs: 4,
        expectedStatus: "budget-exceeded",
      },
    ]

    for (const profile of profiles) {
      const verdict = createPerformanceBudgetVerdict(profile)

      expect(verdict).toMatchObject({
        scenario: profile.scenario,
        status: profile.expectedStatus,
        baselineMs: profile.baselineMs,
        budgetMs: profile.budgetMs,
        noiseThresholdMs: profile.noiseThresholdMs,
        sampleCount: profile.samplesMs.length,
      })
      expect(verdict.representativeDurationMs).toBeGreaterThan(0)
      expect(verdict.slowestSampleMs).toBeGreaterThanOrEqual(verdict.representativeDurationMs)
    }
  })

  it("использует median как representative duration и не считает одиночный spike регрессией", () => {
    const verdict = createPerformanceBudgetVerdict({
      scenario: "start with isolated infra spike",
      samplesMs: [49, 50, 91],
      baselineMs: 47,
      budgetMs: 70,
      noiseThresholdMs: 4,
    })

    expect(verdict.status).toBe("ok")
    expect(verdict.representativeDurationMs).toBe(50)
    expect(verdict.slowestSampleMs).toBe(91)
    expect(verdict.regressionThresholdMs).toBe(51)
    expect(verdict.regressionDeltaMs).toBeLessThanOrEqual(0)
  })

  it("блокирует некорректный budget contract до запуска controlled профилей", () => {
    expect(() => createPerformanceBudgetVerdict({
      scenario: "broken budget",
      samplesMs: [12, 13],
      baselineMs: 20,
      budgetMs: 10,
      noiseThresholdMs: 0,
    })).toThrow("budgetMs не может быть меньше baselineMs")

    expect(() => createPerformanceBudgetVerdict({
      scenario: "missing samples",
      samplesMs: [],
      baselineMs: 20,
      budgetMs: 30,
      noiseThresholdMs: 0,
    })).toThrow("Нужен хотя бы один controlled sample")
  })
})
