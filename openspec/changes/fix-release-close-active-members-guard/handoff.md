## Миссия

- Что должен изменить этот change: запретить закрытие release с активными members состава на уровне контракта, админской инструкции и traceability-guard.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-openspec`
- strategy_root: `focus-workflow`
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: OpenSpec-слой управляет жизненным циклом changes, включая release orchestration, traceability и закрытие исполнительских веток.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия у `focus-workflow`, тактика у `dispatcher-openspec`, финальная приёмка у внешнего проверяющего.

## Обязательные источники

- `openspec/specs/admin-tools/spec.md`
- `tools/README.md`
- `tools/testing/traceability/change-rules.mjs`
- `tools/testing/traceability/changes.mjs`
- `test/unit/openspec-roadmap-inheritance.test.ts`

## Границы исполнения

- Что входит в этот change: правило закрытия release, операционная инструкция и traceability-regression.
- Что сознательно не входит в этот change: создание отдельной `os:close` для release, изменение жизненного цикла implement/fix, переработка архива changes.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: release продолжает управлять delivery-матрицей через `release_ref`, а не через `parent_change`.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit -- test/unit/openspec-release-closure.test.ts`
- Что именно должен доказать результат проверки: active change не может бесшумно ссылаться на архивированный release, а сообщение явно требует сначала закрыть весь активный состав release.

## Открытые вопросы

- Нужен ли следующим change отдельный release-specific close tool, который будет останавливать архивирование до перемещения каталога.
