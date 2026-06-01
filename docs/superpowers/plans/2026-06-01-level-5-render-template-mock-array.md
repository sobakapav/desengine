# Level 5 Render Template Mock Array Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить level-owned `App.tsx` для `level-5`, который рендерит `Component` по каждому элементу `mock`-массива и откатывается к одиночному рендеру, если `mock` не массив.

**Architecture:** Использовать уже существующий механизм level-specific Sandpack template без изменения общего runtime-пути. Поведение `level-5` зафиксировать внутри `onboarding/levels/level-5/sandpack/App.tsx`, а unit-тестами доказать, что preview использует новый шаблон и не ломает fallback/предыдущие уровни.

**Tech Stack:** TypeScript, React, Vitest, существующий Sandpack preview runtime.

---

### Task 1: Добавить level-owned template для `level-5`

**Files:**
- Create: `onboarding/levels/level-5/sandpack/App.tsx`
- Reference: `onboarding/levels/level-1/sandpack/App.tsx`
- Reference: `onboarding/levels/level-2/sandpack/App.tsx`

- [ ] **Step 1: Зафиксировать ожидаемое поведение в тестах preview/template**

Цель тестов:
- `level-5` читает собственный `App.tsx` как level-owned template;
- если `mock` массив, шаблон содержит прямой `.map(...)`;
- если `mock` не массив, шаблон содержит fallback к одиночному рендеру через `mockProps ?? mock`.

- [ ] **Step 2: Реализовать `onboarding/levels/level-5/sandpack/App.tsx`**

Требования к шаблону:
- импортировать `React`, `Component`, `mockModule`, `levelRuntime`;
- сохранить `void levelRuntime`;
- выделить helper для одиночного рендера по аналогии с `level-1` / `level-2`;
- выделить helper, который возвращает массив plain-object элементов только если `mock` действительно массив;
- в `App` сначала пытаться рендерить массив через `.map(...)`, иначе рендерить один `Component`.

- [ ] **Step 3: Не добавлять лишний runtime scope**

Не менять:
- `lib/lab/sandpack-template-fallback.ts`
- общий resolver template по уровню
- шаблоны `level-1` и `level-2`

### Task 2: Обновить unit-покрытие выбора template и preview payload

**Files:**
- Modify: `test/unit/sandpack-template.test.ts`
- Modify: `test/unit/sandpack-preview.test.ts`
- Reference: `lib/lab/sandpack-template.ts`
- Reference: `lib/lab/sandpack-preview.ts`

- [ ] **Step 1: Написать/расширить failing test для template-level выбора**

Проверка:
- `readLevelSandpackTemplate("level-5")` возвращает `source: "level"` в реальном репозитории;
- `appTsx` содержит маркеры прямого перебора массива и fallback-логики.

- [ ] **Step 2: Написать/расширить failing test для preview payload**

Проверка:
- при передаче level-5 `appTemplate` payload в `/src/App.tsx` содержит `.map(...)`;
- payload продолжает встраивать `level-template-runtime`;
- тест не требует реального исполнения React, только сборку runtime-файлов.

- [ ] **Step 3: Добавить защиту от регрессии предыдущих уровней**

Проверка:
- существующий контракт `level-1` / `level-2` не меняется;
- fallback template по-прежнему работает для уровня без своего `App.tsx`.

### Task 3: Локальная проверка change

**Files:**
- Verify only: `onboarding/levels/level-5/sandpack/App.tsx`
- Verify only: `test/unit/sandpack-template.test.ts`
- Verify only: `test/unit/sandpack-preview.test.ts`

- [ ] **Step 1: Запустить unit-проверку из metadata**

Run: `npm run test:unit -- test/unit/sandpack-template.test.ts test/unit/sandpack-preview.test.ts`

Ожидаемо:
- тесты проходят;
- новый `level-5` template используется;
- регрессий по fallback/предыдущим уровням нет в рамках этого набора.

- [ ] **Step 2: Подготовить результат для внешней верификации**

Нужно сообщить:
- какие файлы изменены;
- какие именно сценарии доказаны unit-тестами;
- что финальная проверка и формулировка “прогнал тесты” должны идти от другого агента.
