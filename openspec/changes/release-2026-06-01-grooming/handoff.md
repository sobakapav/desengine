## Миссия

- Перевести активную integration-wave на новый release `release-2026-06-01-grooming`, чтобы historical release от 25 мая можно было архивировать без разрыва active traceability.
- Этот change не меняет код и не принимает архитектурные решения за dispatcher; он фиксирует состав поставки и release lineage.

## Унаследованный контекст

- parent_change: (не задан)
- strategy_root: (не задан)
- release_ref: (не задан)
- producer_ref: (не задан)
- Что уже решено: исследование `producer-test-system-current-state` показало, что `test:integration` должен развиваться как отдельный server/API контур на mock/fixture-данных.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику и routing delivery держит `dispatcher-test-system`, а release фиксирует только состав grooming-wave.

## Обязательные источники

- openspec/changes/release-2026-06-01-grooming/proposal.md
- openspec/changes/producer-test-system-current-state/baseline.md
- openspec/changes/producer-test-system-current-state/roadmaps/test-system-current-state.md
- openspec/changes/dispatcher-test-system/proposal.md
- openspec/changes/dispatcher-test-system/design.md
- metadata и proposal всех changes, которые получают `release_ref=release-2026-06-01-grooming`

## Границы исполнения

- Что входит в этот change: создание релизной метки и фиксация состава grooming-wave.
- Что сознательно не входит в этот change: реализация test runner, добавление integration-тестов, изменение install-critical стека, пересмотр parent dispatcher.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: границы тестового слоя, child topology и правила тестовой части принадлежат `dispatcher-test-system` и `focus-quality`.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: новый release change корректно оформлен, downstream changes ссылаются на него через `release_ref`, а старый release может быть архивирован.

## Открытые вопросы

- Нужно ли включать в этот же release последующую волну integration для auth/system update route, если её оформят отдельным change после уточнения контрактов.
