## Миссия

- Что должен изменить этот change: сделать release notes обязательной частью close-пути для release-linked implement/fix changes и начать вести `release-2026-06-02-quality` в пользовательском формате.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-openspec`
- strategy_root: `focus-workflow`
- release_ref: `release-2026-06-02-quality`
- producer_ref: (не задан)
- Что из родительского change уже решено: OpenSpec-слой владеет release orchestration, handoff, close-процедурой и traceability административных инструментов.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия у `focus-workflow`, тактика у `dispatcher-openspec`, финальную приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/specs/admin-tools/spec.md`
- `tools/README.md`
- `tools/openspec-close-change.mjs`
- `openspec/changes/release-2026-06-02-quality/release-notes.md`
- `openspec/changes/implement-test-performance-budget-verdicts/proposal.md`
- `test/unit/browser-verification-runtime.test.ts`

## Границы исполнения

- Что входит в этот change: release-note артефакт для release-linked changes, автоматическое добавление записи при `os:close`, обновление текущих release notes quality-волны и unit/static-покрытие процесса.
- Что сознательно не входит в этот change: отдельный publish workflow для release, генерация release notes из кода без участия человека, ретро-миграция всех архивных релизов.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `os:close` остаётся административным каскадом implement/fix change, а release продолжает быть delivery-меткой через `release_ref`.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit -- test/unit/openspec-release-notes.test.ts test/unit/browser-verification-runtime.test.ts`
- Что именно должен доказать результат проверки: release-linked change с готовым release-note артефактом корректно попадает в `release-notes.md`, повторная попытка не дублирует запись, а затронутый `os:close`-контракт не ломает существующий browser-preflight path.

## Открытые вопросы

- Нужно ли в следующей волне отдельно валидировать качество release-note текста сильнее, чем простое наличие обязательных секций.
