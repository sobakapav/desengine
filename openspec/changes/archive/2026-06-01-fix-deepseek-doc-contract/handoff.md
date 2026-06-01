## Миссия

- Что должен изменить этот change: согласовать внешний documentation contract DeepSeek с уже принятым fail-fast поведением image-bearing lab-flow, чтобы администратор и инженер сопровождения не получали ложных ожиданий от провайдера.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-doc
- strategy_root: focus-public
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-doc` уже отделил документационный контур от runtime и help-слоя. Профильные provider-docs в `docs/**` считаются частью внешнего инженерного контракта и должны синхронизироваться с наблюдаемым поведением системы.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-doc`; этот fix отвечает за локальный drift вокруг DeepSeek и за anti-regression guard в source-contract слое.

## Обязательные источники

- openspec/changes/dispatcher-doc/proposal.md
- openspec/specs/llm/spec.md
- openspec/specs/deepseek/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-deepseek-doc-contract: `docs/deepseek.md`, `openspec/changes/fix-deepseek-vision-contract/proposal.md`, `openspec/changes/fix-deepseek-vision-contract/handoff.md`, `lib/llm/providers/deepseek.ts`, `test/unit/p2-source-contracts.test.ts`.

## Границы исполнения

- Что входит в этот change: обновление профильной DeepSeek-документации под fail-fast contract, синхронизация operator-facing формулировки ограничения и static/source-contract guard против возврата старого текста.
- Что сознательно не входит в этот change: изменение runtime-поведения DeepSeek, добавление vision support, пересмотр других provider adapters без отдельного evidence.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: решение `fail-fast вместо silent text-only fallback` уже принято в `fix-deepseek-vision-contract`; этот change не должен откатывать его в документации как будто fallback по-прежнему является нормой.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:unit -- test/unit/p2-source-contracts.test.ts`
- Что именно должен доказать результат проверки: профильная документация больше не обещает text-only работу image-bearing сценариев через DeepSeek, а source-contract ловит возврат к устаревшей формулировке.

## Root Cause

- Runtime boundary уже исправлен, но documentation contract остался в старом состоянии. Поэтому оператор, читая `docs/deepseek.md`, получает ложную модель системы: будто image-bearing сценарий продолжит работать без картинок.
- Этот drift особенно вреден именно после fail-fast исправления: пользователь не просто получает менее точный результат, а получает ранний отказ, который документация никак не готовит.

## Что должно получиться

- `docs/deepseek.md` описывает реальное наблюдаемое ограничение.
- source-contract test защищает документацию от возврата к старому text-only обещанию.
- активный runtime fix и его внешняя документация больше не противоречат друг другу.

## Открытые вопросы

- Нужно ли в этом же change дополнительно упомянуть DeepSeek-ограничение в root-документах, если там появится более подробное сравнение провайдеров.
