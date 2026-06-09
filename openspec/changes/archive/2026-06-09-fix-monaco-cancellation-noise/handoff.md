## Миссия

- Убрать ложный `Canceled` overlay от Monaco при сохранении видимости настоящих runtime-ошибок.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- Что из родительского change уже решено: downstream `fix-*` change обязан иметь воспроизводимый симптом, локальную границу исправления и явную runnable-проверку.
- Кто отвечает за стратегию, тактику и приёмку результата: `dispatcher-bugfix` маршрутизирует дефект, внешний проверяющий подтверждает корректность узкого suppression и запускает тесты.

## Обязательные источники

- `openspec/changes/dispatcher-bugfix/proposal.md`
- `components/desengine/lab/Code/MonacoCodeEditor.tsx`
- `test/unit/monaco-cancellation-noise.test.ts`
- `test/unit/p1-source-contracts.test.ts`
- `openspec/specs/level-labs/spec.md`

## Границы исполнения

- Что входит в этот change: узкий suppression benign Monaco cancellation, тест на фильтр и source-contract guard на listener lifecycle.
- Что сознательно не входит в этот change: замена Monaco loader, переход с CDN на локальный bundle, подавление любых других browser ошибок.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/monaco-cancellation-noise.test.ts test/unit/p1-source-contracts.test.ts`
- Что именно должен доказать результат проверки: подавляется только характерный Monaco `Canceled`, а код editor wrapper ставит и снимает локальный `unhandledrejection` listener.

## Открытые вопросы

- Нужен ли отдельный browser smoke, если после unit/source-contract проверки симптом больше не воспроизводится в dev overlay.
