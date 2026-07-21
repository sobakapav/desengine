## Миссия

- Что должен изменить этот change: Убрать uiMode из project contract и жёстко оставить только ui-kit runtime
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: project boundary, project registry, workflow/workbench binding и project-facing surfaces уже существуют; этот fix только упрощает contract, убирая `uiMode` и оставляя единственный `uiKitId`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, тактическую рамку этой волны держит `dispatcher-project`, финальную приёмку и verification выполняет внешний проверяющий агент.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-project-ui-mode-removal: `lib/project/runtime.ts`, `lib/project/config-surface.ts`, `components/desengine/project/projectSurface.ts`, `components/desengine/project/ProjectConfigPanel.tsx`, `openspec/specs/projects/spec.md`, `openspec/specs/storage-adapter/spec.md`, `test/unit/project-ui-kit-switching.test.ts`, `test/unit/project-config-and-ui-kit-contract.test.ts`.

## Границы исполнения

- Что входит в этот change: удаление `uiMode` из canonical project types, route/query/body payloads, prompt/preview contract, project UI и active OpenSpec/tests.
- Что сознательно не входит в этот change: добавление нового runtime-режима, пересмотр списка доступных UI kit, перепроектирование migration UX и browser harness сверх обязательной синхронизации контрактов.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: сам project-aware runtime остаётся в силе; сохраняется project-level выбор `uiKitId`; workflow/workbench/project surfaces продолжают жить как отдельные project-facing срезы.

## Проверка результата

- verification_level: static/contract + unit
- verification_command: `npm run test:traceability && npm run test:unit -- project-ui-kit-switching project-config-and-ui-kit-contract project-user-surface-foundation`
- Что именно должен доказать результат проверки: в активном коде и контрактах больше нет рабочего branch по отдельному runtime-режиму; project runtime всегда работает только через `uiKitId`, а project-facing surfaces не читают и не записывают удалённый параметр.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: нужно ли временно сохранять backward-compatible чтение старых persisted проектов с `uiMode` в storage normalization, при том что наружу и в active contract этот параметр больше не должен выходить.
