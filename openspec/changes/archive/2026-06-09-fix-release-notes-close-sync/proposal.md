# Proposal: fix-release-notes-close-sync

## Проблема

`release-notes.md` в активном релизе пока ведётся вручную и никак не связан с обычным `os:close`. Из-за этого change может быть технически реализован и даже закрыт, но в пользовательском описании релиза о нём ничего не появится или запись будет слишком внутренней и непонятной.

## Что меняется

- Для release-linked `implement`/`fix` change вводится обязательный артефакт `artifacts/release-note.md`.
- `os:close` перед архивированием добавляет этот артефакт в `release-notes.md` соответствующего релиза.
- Запись в release notes должна быть написана простым языком: что пользователь получает, как это на него влияет и как вручную убедиться, что change действительно реализован.
- Если запись уже была добавлена раньше, `os:close` не дублирует её повторно.

## Тестирование

- Capability: `admin-tools`
- Scenarios:
  - `Разработчик закрывает release-linked implement/fix change`
  - `Release notes уже содержат запись о change`
- Уровень: `unit`, `static/contract`
- Команды:
  - `npm run test:unit -- test/unit/openspec-release-notes.test.ts test/unit/browser-verification-runtime.test.ts`
  - `npm run test:traceability`
