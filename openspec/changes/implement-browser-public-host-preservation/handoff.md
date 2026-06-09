## Миссия

- Что должен изменить этот change: сохранить публичный host/domain в browser/dev wrapper и не подменять его на localhost без явного opt-in.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-bugfix` требует оформлять воспроизводимые дефекты отдельными кодовыми changes с явной runnable-проверкой и без смешения с redesign.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию quality-контура держит `focus-quality`, bugfix-маршрутизацию держит `dispatcher-bugfix`, итоговую внешнюю проверку выполняет другой проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-bugfix/proposal.md`
- `openspec/changes/dispatcher-bugfix/handoff.md`
- `tools/testing/run-browser-verification-runtime.mjs`
- `test/helpers/browser-verification.ts`
- `test/README.md`
- `test/e2e/browser-verification-runtime.spec.ts`

## Границы исполнения

- Что входит в этот change: browser/dev wrapper host contract, public base URL handling, distinction between bind-host and public host, связанные browser tests и docs.
- Что сознательно не входит в этот change: переписывание app redirect helpers, install-critical перестройка стека, исправление посторонних browser-spec вне host normalization.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: bugfix остаётся локализованным, runnable browser verification обязательна, а стратегический quality-контур не пересматривается.

## Проверка результата

- verification_level: component/browser
- verification_command: `node tools/testing/run-browser-verification-runtime.mjs test/e2e/browser-verification-runtime.spec.ts`
- Что именно должен доказать результат проверки: browser/dev wrapper сохраняет публичный host/domain там, где это требуется contract-ом, и не уводит flow на localhost без явного разрешения.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: нужен ли отдельный env для public base URL; как именно совместить внешний host и managed bind-host без регресса localhost-default path.
