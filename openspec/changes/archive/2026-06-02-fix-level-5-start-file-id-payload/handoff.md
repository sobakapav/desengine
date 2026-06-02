## Миссия

- Что должен изменить этот change: убрать падение start-flow, когда модель возвращает `fileId`/`fileName` вместо содержимого обязательного рабочего файла.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-bugfix`
- strategy_root: `focus-quality`
- release_ref: `release-2026-06-01-grooming`
- producer_ref: (не задан)
- Что из родительского change уже решено: багfix changes должны быть узкими, доказуемыми и не превращаться в перепроектирование стартового LLM-flow.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику локального исправления держит `dispatcher-bugfix`, финальная приёмка идёт через внешний проверочный прогон.

## Обязательные источники

- `lib/task/actions/shared.ts`
- `lib/task/actions/start-llm.ts`
- `lib/lab/workbench.ts`
- `test/unit/workbench-output.test.ts`
- Какие ещё файлы и спецификации обязательны к чтению для fix-level-5-start-file-id-payload: `lib/task/actions/start-stage.ts`, `lib/task/actions/start.ts`, `openspec/specs/component-file-set/spec.md`, `openspec/specs/llm/spec.md`, `openspec/specs/task/spec.md`

## Границы исполнения

- Что входит в этот change: repair-path в start normalization, safe fallback для обязательных start files, unit-покрытие на placeholder payload.
- Что сознательно не входит в этот change: переписывание prompts, новый structured-output schema, ослабление iterate/check validator, перепроектирование level-5 render-template.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: file-set системы остаётся прежним; validator остаётся строгим; bugfix не должен переопределять общий продуктовый контракт старта уровня.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit -- test/unit/task-start-llm.test.ts test/unit/workbench-output.test.ts`
- Что именно должен доказать результат проверки: placeholder-ответ вида `component`/`Component.tsx` и аналог для stories перестаёт ломать start normalization, а валидатор по-прежнему отсекает некорректный payload вне repair-path.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие минимальные scaffolds безопасны для `Component.tsx` и `Component.stories.ts`; считать ли placeholder-ремонт только для старта или шире; нужен ли отдельный telemetry-signal позже.
