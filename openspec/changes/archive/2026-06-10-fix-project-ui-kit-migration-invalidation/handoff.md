## Миссия

- Что должен изменить этот change: закрыть контрактный разрыв между project `UI kit` switching и producer-правилом тяжёлой migration, чтобы task/workflow/workbench progress переоценивался явно и честно.
- Этот change исправляет наблюдаемое поведение project contract и не подменяет foundation project entity или task/workflow/workbench binding ветки.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: `dispatcher-project` уже выделил тяжёлую migration в отдельный срез; `producer-project` заранее зафиксировал, что смена project `UI kit` может откатывать прогресс.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, тактику первой project-wave держит `dispatcher-project`, итоговую приёмку выполняет внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-project/proposal.md`
- `openspec/changes/producer-project/proposal.md`
- `openspec/changes/producer-project/design.md`
- `openspec/specs/projects/spec.md`
- `openspec/specs/user-progress/spec.md`
- `openspec/specs/level-labs/spec.md`

## Границы исполнения

- Что входит в этот change: migration semantics для project `UI kit`, progress invalidation rules и migration-facing diagnostics/status.
- Что сознательно не входит в этот change: автоматическая конвертация пользовательского кода между UI kit'ами, `Project Roadmap`, общая project entity/storage foundation.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: producer уже решил, что project `UI kit` migration тяжёлая и может откатывать прогресс; этот change не спорит с самим существованием project mode.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: OpenSpec больше не описывает смену project `UI kit` как безвредный toggle; реализация обязана дополнительно подтвердить unit/integration/browser слои, если они затронуты.

## Открытые вопросы

- На каком MVP-уровне пользователю показывается migration summary и что именно в нём обязано быть перечислено.
