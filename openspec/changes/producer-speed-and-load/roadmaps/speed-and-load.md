# Roadmap: speed-and-load

## Миссия

Обеспечить приемлемую скорость работы системы и задать рамки допустимой нагрузки так, чтобы проблемы производительности, утечки и деградации больше не велись как разрозненные инциденты без общего owner-контекста.

## Что должен помнить producer

- У системы есть признаки утечек, причины которых пока не установлены.
- Скорость работы и устойчивость под нагрузкой должны обсуждаться не абстрактно, а через измеряемые профили и guardrail'ы.
- Без producer-owned рамки downstream delivery-ветки будут спорить о критериях, а не двигать систему к улучшению.

## Основные линии

### 1. Карта симптомов

- собрать подтверждённые симптомы деградации;
- отделить гипотезы от уже воспроизводимых проблем;
- фиксировать, в каких режимах проявляется проблема.

### 2. Рамки допустимой нагрузки

- определить ключевые профили нагрузки;
- определить, какие режимы система обязана выдерживать;
- описать признаки выхода за допустимые рамки.

### 3. Измеримость и наблюдаемость

- определить, какие метрики и замеры обязательны;
- определить, где нужны профилирование, runtime-замеры, smoke или integration-проверки;
- фиксировать, каких данных не хватает для осмысленного решения.

### 4. Downstream-организация

- запускать `dispatcher` changes на локализацию причин;
- запускать `dispatcher` changes на измерение и профилирование;
- запускать delivery-ветки на конкретные исправления только после достаточной постановки.

## Первичная карта `npm run start`

### Точки ускорения

1. Preview/workbench payload pipeline.
   - `app/api/tasks/[taskId]/sandpack/route.ts` заново собирает preview payload.
   - `lib/system/shadcn-files.ts` может рекурсивно читать всё дерево `components/ui`.
   - `lib/lab/sandpack-runtime-dependencies.ts` разворачивает dependency graph из `node_modules`.
   - `lib/lab/sandpack-preview.ts` компилирует derived preview artifacts и держит cache без явно зафиксированного budget-контракта.

2. Повторный user-facing action loop вокруг task actions.
   - `start`, `iterate`, `check`, `save`, `reset` уже сериализуются по `taskId`, но пока не имеют bounded pressure policy.
   - Latency и machine-level нагрузка могут расти не только из-за самого LLM, но и из-за накопленного backlog.

3. Expensive LLM input/output path.
   - `start` / `iterate` / `check` собирают большие instructions, картинки, file contexts и structured-output.
   - У runtime уже есть timeout'ы, но нет явных budget'ов на размер payload и write-set.

### Точки ограничителей

1. Mutation backlog guardrail.
   - Нужен лимит на per-task очередь и на process-level pending load.

2. Preview resource guardrail.
   - Нужен bounded cache и controlled degradation path вместо неограниченного роста derived artifacts.

3. LLM payload / write-set guardrail.
   - Нужны явные ограничения на instruction, structured-output и итоговую запись файлов.

## Текущий downstream-набор

- `dispatcher-workbench` -> `implement-workbench-preview-payload-budgeting`
- `dispatcher-runtime` -> `implement-runtime-task-load-guardrails`
- `dispatcher-runtime` -> `implement-runtime-llm-payload-budgets`

## Глобальная follow-up волна

- `dispatcher-test-system` -> `implement-test-performance-budget-verdicts`
- `dispatcher-test-system` -> `implement-test-speed-load-regression-harness`
- `dispatcher-runtime` -> `implement-runtime-speed-observability`

## Producer-owned coverage map

- Каноническая матрица рисков, owners, guardrail'ов, тестов и observability хранится в:
  - `openspec/changes/producer-speed-and-load/artifacts/npm-start-speed-load-coverage-map.md`

## Принципы

- Producer не чинит код напрямую.
- Producer не подменяет собой dispatcher.
- Любые конкретные runtime-исправления и нагрузочные guardrail'ы должны проходить через downstream delivery changes.
