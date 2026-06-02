## Context

Контракт reset уже разделён на два scope:
- полный reset задачи;
- reset только текущего уровня.

Оба сценария должны синхронно очищать зависимые пользовательские артефакты внутри своего scope. Для пользователя это означает не только удаление файлов, но и удаление связанного runtime-состояния: истории уточнений и результата проверки.

## Design Direction

Нужен узкий regression-fix, а не redesign:
- восстановить согласованную очистку history/check state для reset scope;
- не менять существующие entrypoints reset;
- опереться на уже существующий browser guard уровня reset, а не придумывать отдельный verification path.

## Risks

- [Частичный reset] если очищаются только файлы, но остаются история или результат проверки, пользователь получает ложное ощущение чистого старта.
- [Смешение scope] если reset текущего уровня заденет данные уже завершённых уровней, bugfix создаст новый регресс progression.

## Verification

- Capability: `iteration`
- Scenarios:
  - `Пользователь сбрасывает задачу`
  - `Пользователь сбрасывает только текущий уровень`
- Уровень проверки: `component/browser`
- Команды:
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/level-reset-granularity.spec.ts`
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/task-reset-history-cleanup.spec.ts`
