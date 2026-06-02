## Миссия

- Что должен изменить этот change: научить Sandpack preview рендерить все object-like mock-константы из `mock.ts`, а к `mock` переходить только если отдельных named object exports нет.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-bugfix`
- strategy_root: `(не задан)`
- release_ref: `release-2026-06-01-grooming`
- producer_ref: (не задан)
- Что из родительского change уже решено: Sandpack preview уже использует level-owned `App.tsx`/fallback template и runtime-contract boundary.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия у `dispatcher-bugfix`, локальная реализация у этого fix, финальная приёмка у внешнего проверяющего.

## Обязательные источники

- `lib/lab/sandpack-templates/default/App.tsx`
- `lib/lab/sandpack-template-fallback.ts`
- `test/unit/sandpack-preview.test.ts`
- Какие ещё файлы и спецификации обязательны к чтению для fix-preview-mock-export-collection: `openspec/specs/level-labs/spec.md`, `test/unit/sandpack-template.test.ts`, `lib/lab/sandpack-preview.ts`.

## Границы исполнения

- Что входит в этот change: изменить контракт выбора mock-данных для preview и покрыть его unit-тестами.
- Что сознательно не входит в этот change: изменение формата пользовательского `mock.ts`, переделка workbench editor UX, смена canonical структуры Sandpack payload.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: существование `mock` как fallback-контракта, использование level App template и runtime boundary.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit -- test/unit/sandpack-preview.test.ts test/unit/sandpack-template.test.ts`
- Что именно должен доказать результат проверки: preview template рендерит все object-like named exports из `mock.ts`, а если их нет — остаётся совместим с `mock`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: не потеряется ли runtime-contract boundary и останется ли шаблон совместим с уже существующими single-object и array mock-сценариями.
