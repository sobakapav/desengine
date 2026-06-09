# Handoff: fix-release-link-sync

## Миссия

- Поставить жёсткий заслон на partial release inclusion.
- Сделать так, чтобы `os:dispatch` обновлял release-привязку полностью: и `.openspec.yaml`, и `handoff.md`, с явной post-check перед success.

## Унаследованный контекст

- parent_change: `dispatcher-openspec`
- strategy_root: `focus-governance`
- release_ref: `release-2026-06-02-quality`
- producer_ref: (не задан)
- Что из родительского change уже решено: release в проекте является delivery-связью для implement/fix, а handoff считается обязательной частью исполнительского контекста.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-governance`, тактический OpenSpec/tooling-контур держит `dispatcher-openspec`, финальную проверку делает внешний проверяющий.

## Обязательные источники

- `openspec/specs/admin-tools/spec.md`
- `tools/openspec-dispatch-change.mjs`
- `tools/openspec-begin-change.mjs`
- `tools/openspec-handoff.mjs`
- `tools/openspec-change-state.mjs`
- `test/unit/openspec-handoff.test.ts`

## Границы исполнения

- Что входит в этот change: sync release_ref между metadata и handoff, post-check, unit coverage и contract wording.
- Что сознательно не входит в этот change: переписывание чужих handoff вручную, финальный запуск тестов, пересмотр release member policy в целом.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: release остаётся delivery-меткой, а не иерархическим parent; код меняется только на уровне implement/fix.

## Проверка результата

- verification_level: `static/contract + unit`
- verification_command: `npm run test:traceability && npm run test:unit -- openspec-handoff`
- Что именно должен доказать результат проверки: release dispatch не оставляет partial state между `.openspec.yaml` и `handoff.md`.

## Открытые вопросы

- Есть ли в active слое уже существующие changes с ранее накопленным расхождением между metadata и handoff по `release_ref`.
