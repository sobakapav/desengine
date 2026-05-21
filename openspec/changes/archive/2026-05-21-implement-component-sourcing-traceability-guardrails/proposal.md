## Why

Dispatcher `dispatcher-platform-component-sourcing-strategy` зафиксировал политику `reuse / adapt / build`, но активный runtime всё ещё не доводит её до enforceable слоя:

- в `openspec/specs/**` отсутствует активный capability `component-sourcing`;
- workbench registry хранит sourcing decision неполно и не требует fallback/degradation strategy;
- traceability-тесты не размечают сценарии `component-sourcing`, поэтому политика остаётся декларативной.

## What Changes

- Добавить активный capability `component-sourcing` и связанный spec в текущий OpenSpec слой.
- Ужесточить `WorkbenchSourcingDecision`: требовать `fallback/degradation strategy`, `adapterPolicy` и корректный `testLevel`.
- Обновить lab workbench registry и unit-тесты так, чтобы sourcing policy проверялась автоматически.
- Синхронизировать change-локальные specs с новым enforceable-контрактом.

## Impact

- `component-sourcing` перестаёт быть только стратегическим намерением и становится проверяемым source-contract.
- Новые Workbench tools обязаны описывать fallback/degradation поведение до попадания в registry.
