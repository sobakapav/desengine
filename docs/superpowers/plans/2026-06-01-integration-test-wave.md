# Integration Test Wave Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Включить runnable integration-слой для server/API boundary и заполнить его первой полезной волной route-сценариев без браузера и live credentials.

**Architecture:** Добавляем отдельный Vitest project `integration`, общий integration harness для прямого вызова route handlers и fixture env/temp state, затем покрываем foundation runner smoke-тестами и первой route-wave для task, llm status и onboarding update. Документацию и OpenSpec tasks синхронизируем с фактическим контуром.

**Tech Stack:** TypeScript, Vitest projects, Next.js route handlers, OpenSpec, локальные fixtures/mocks.

---

### Task 1: Foundation Integration Runner

**Files:**
- Modify: `package.json`
- Modify: `vitest.config.ts`
- Create: `test/integration/helpers/route-harness.ts`
- Create: `test/integration/helpers/temp-user-state.ts`
- Create: `test/integration/runner-foundation.test.ts`
- Modify: `openspec/changes/implement-integration-test-runner-foundation/tasks.md`

- [ ] Добавить failing integration tests для harness/runner contract.
- [ ] Перевести `npm run test:integration` с placeholder на `vitest run --project integration`.
- [ ] Добавить Vitest project `integration` в `node`-окружении.
- [ ] Реализовать shared helpers для вызова route handlers, разбора `Response` и temp user-state.
- [ ] Обновить OpenSpec tasks у `implement-integration-test-runner-foundation`.

### Task 2: First Route/API Wave

**Files:**
- Create: `test/integration/task-routes.test.ts`
- Create: `test/integration/llm-status-route.test.ts`
- Create: `test/integration/onboarding-update-route.test.ts`
- Modify: `test/traceability/spec-coverage-map.json`
- Modify: `openspec/changes/implement-route-integration-fixture-wave/tasks.md`

- [ ] Добавить failing integration tests для task route handlers на stubbed runtime boundary.
- [ ] Добавить failing integration test для `GET /api/status/llm`.
- [ ] Добавить failing integration test для `POST /api/onboarding/update`.
- [ ] Реализовать/доработать harness-моки так, чтобы route tests проходили на fixture boundary без live effects.
- [ ] Обновить traceability metadata и OpenSpec tasks у `implement-route-integration-fixture-wave`.

### Task 3: Documentation Sync

**Files:**
- Modify: `docs/testing-layer.md`
- Modify: `test/README.md`

- [ ] Обновить описание `test:integration` как runnable слоя.
- [ ] Зафиксировать границы integration против unit/e2e/live.
- [ ] Описать fixture/mock/temp-user-state ожидания для route wave.

### Task 4: External Verification Handoff

**Files:**
- Modify: `openspec/changes/implement-integration-test-runner-foundation/tasks.md`
- Modify: `openspec/changes/implement-route-integration-fixture-wave/tasks.md`
- Modify: `openspec/changes/implement-integration-test-runner-foundation/handoff.md` (если понадобится)
- Modify: `openspec/changes/implement-route-integration-fixture-wave/handoff.md` (если понадобится)

- [ ] Отметить выполненные task checkboxes по факту реализации.
- [ ] Подготовить изменения к внешней проверке без самостоятельной финальной верификации.
