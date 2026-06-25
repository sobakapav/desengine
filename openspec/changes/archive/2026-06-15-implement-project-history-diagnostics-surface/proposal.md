## Why

Project-aware runtime уже сохраняет значимую историю внутри project scope, но пользователь почти не видит этот слой. Из-за этого:

- prompt history проекта остаётся скрытой внутренней записью;
- результат проверок и reset snapshots не складываются для пользователя в историю проекта;
- migration status существует, но не читается как часть общей диагностики проекта;
- проект выглядит как статическая карточка, хотя фактически уже накапливает рабочий след.

## What Changes

- Поднять project-scoped history/diagnostics surface на странице проекта.
- Показать пользователю:
  - prompt history проекта;
  - check results;
  - рабочие файлы и их project scope;
  - reset snapshots;
  - migration status как часть диагностики проекта.
- Не вводить новую runtime-модель и не ломать существующий project-aware storage contract.

## Impact

- Проект становится не только контейнером настроек, но и наблюдаемым рабочим контекстом.
- Следующие project-facing waves получат базу для explainability без ручного чтения скрытых runtime файлов.
