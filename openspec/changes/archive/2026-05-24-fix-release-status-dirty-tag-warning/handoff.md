## Миссия

- Что должен изменить этот change: убрать ложное ощущение нерелизной версии при работе из релизного тега с локальными изменениями
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-24-night
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-bugfix` маршрутизирует входящий поток багов в отдельные fix-change и не пересматривает стратегию `focus-quality`; текущий fix должен локально исправить релизную диагностику без затрагивания install-critical инфраструктуры.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-quality`, тактические рамки и приоритет удерживает `dispatcher-bugfix`, приёмку результата выполняет внешний родительский агент или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/.openspec.yaml
- openspec/changes/dispatcher-bugfix/handoff.md
- openspec/changes/focus-quality/proposal.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-release-status-dirty-tag-warning: `openspec/specs/resource-status/spec.md`, `openspec/changes/archive/2026-05-19-fix-release-state/design.md`, `lib/system/release.ts`, `lib/system/resources/content.json`, `test/unit/resource-status.test.ts`

## Границы исполнения

- Что входит в этот change: скорректировать определение и отображение статуса `system-release`, чтобы локальные изменения поверх точного релизного тега не показывали систему как нерелизную; обновить затронутый контракт OpenSpec и unit-покрытие.
- Что сознательно не входит в этот change: переработка механики обновления системы, смена release-потока, изменение install-critical tooling и любые несвязанные системные статусы.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам подход с диагностикой через capability `resource-status`, обязательность traceability и маршрутизация багфиксов через `dispatcher-bugfix`.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: unit-тесты подтверждают, что точный релизный тег остаётся релизным состоянием даже при dirty worktree, а текст ресурса остаётся согласован с обновлённым контрактом.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: нужен ли отдельный warning для dirty worktree на точном теге или достаточно сохранить `upToDate` и явно сообщить о локальных изменениях в detail; какие сценарии capability `resource-status` нужно дописать для фиксации этого поведения.
