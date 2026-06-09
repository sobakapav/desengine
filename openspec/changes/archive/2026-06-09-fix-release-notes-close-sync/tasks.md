## 1. Контракт и формат

- [x] Зафиксировать в `admin-tools`, что release-linked implement/fix change перед закрытием обязан иметь user-facing release-note артефакт.
- [x] Обновить `tools/README.md` и формат `release-notes.md`, чтобы было явно видно: запись пишется простым языком и объясняет ручную проверку.

## 2. Tooling

- [x] Научить `os:close` добавлять запись из `artifacts/release-note.md` в `release-notes.md` релиза до архивирования.
- [x] Сделать close-path идемпотентным и не дублировать запись, если change уже упомянут в release notes.

## 3. Текущий релиз

- [x] Начать вести `openspec/changes/release-2026-06-02-quality/release-notes.md` в пользовательском формате.
- [x] Добавить первую запись для уже реализованного `implement-test-performance-budget-verdicts`.

## 4. Внешняя проверка

- [x] Передать change на внешнюю проверку командами `npm run test:unit -- test/unit/openspec-release-notes.test.ts test/unit/browser-verification-runtime.test.ts` и `npm run test:traceability`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `admin-tools`: `Разработчик закрывает release-linked implement/fix change`
- `admin-tools`: `Release notes уже содержат запись о change`

Уровни проверки:
- unit
- static/contract

Команды запуска:
- `npm run test:unit -- test/unit/openspec-release-notes.test.ts test/unit/browser-verification-runtime.test.ts`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- unit-регрессия использует временное дерево `openspec/changes` с одним release, одним release-linked fix и локальным `artifacts/release-note.md`;
- live credentials не нужны.

Примечание по верификации:
- Финальную проверку и формулировку результата выполняет внешний проверяющий агент или пользователь.
