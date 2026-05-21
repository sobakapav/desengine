## Контекст

- Родительский dispatcher уже определил inventory, критерии `reuse / adapt / build` и adapter boundary policy.
- Активный `openspec/specs/workbench-tools/spec.md` уже требует sourcing decision для tool registry, но не фиксирует fallback/degradation strategy.
- В runtime `lib/workbench/registry.ts` сейчас проверяются только `primitive` и `ownerBoundary`, чего недостаточно для strategy-level governance.
- В unit-покрытии есть проверки `workbench-tools`, но capability `component-sourcing` ещё не связан с runnable тестом.

## Решение

1. Поднять активный spec `openspec/specs/component-sourcing/spec.md` из dispatcher-контекста в рабочий OpenSpec слой.
2. Расширить `WorkbenchSourcingDecision` полем `fallbackStrategy` и валидировать полный набор source-contract полей в `createWorkbenchRegistry`.
3. Обновить lab registry так, чтобы Sandpack, Monaco и локальные controls явно описывали fallback/degradation поведение.
4. Привязать unit-файл `test/unit/workbench-platform-registry.test.ts` к capability `component-sourcing` и добавить негативные сценарии валидации.

## Границы

- Change не добавляет новые runtime dependencies.
- Change не меняет install-critical стек.
- Change не вводит новый browser/e2e слой; enforceable-срез ограничен static/unit contract уровнем.
