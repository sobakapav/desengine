## Миссия

- Зафиксировать `dispatcher-doc` как управляющий change для документационного контура: он удерживает внешний и инженерный documentation contract, маршрутизирует documentation drift в отдельные downstream changes и требует человеко-понятную проверку там, где документация описывает наблюдаемое поведение системы.

## Унаследованный контекст

- parent_change: focus-public
- strategy_root: focus-public
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-public` владеет контуром контента, документации и структурированного общения с пользователем. Roadmap `focus-public/roadmaps/documentation.md` уже закрепляет, что `dispatcher-doc` отвечает за согласованность `README.md`, `docs/**`, локальных developer-инструкций и наблюдаемого поведения системы.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-public`; тактическую маршрутизацию документационной линии держит `dispatcher-doc`; runnable-изменения и runnable-проверки выполняются только в downstream changes.

## Обязательные источники

- openspec/changes/focus-public/proposal.md
- openspec/changes/focus-public/roadmaps/documentation.md
- openspec/changes/dispatcher-doc/proposal.md
- openspec/changes/dispatcher-doc/design.md
- openspec/changes/dispatcher-doc/tasks.md
- openspec/specs/external-local-onboarding/spec.md
- openspec/specs/testing-layer/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для документационной линии: затронутые `openspec/specs/**`, профильные документы в `docs/**`, `README.md`, локальные developer-инструкции и любые active child changes, которые исправляют contract drift.

## Границы исполнения

- Что входит в этот change: определение границ документационного контура, правило маршрутизации documentation drift, разграничение с `dispatcher-help`, требования к тестовой части downstream documentation changes и поддержание handoff для активной линии.
- Что сознательно не входит в этот change: публикация help-страниц в интерфейсе, прямое изменение runtime-кода, install-critical изменения и самостоятельное выполнение runnable-проверок.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `focus-public` уже решил, что документационный контур является отдельной управляемой линией, а roadmap documentation требует синхронизации документов с наблюдаемым поведением системы.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: `dispatcher-doc` оформлен как no-code dispatcher, его границы и классы child changes определены явно, а downstream documentation changes получают читаемые требования к проверке и traceability.

## Активные downstream changes

- `fix-deepseek-doc-contract`
  - Роль: устранить drift между текущим fail-fast contract DeepSeek и профильной документацией провайдера.
  - Почему это child именно `dispatcher-doc`: проблема лежит в operator-facing и developer-facing документационном контракте, а не в help-страницах и не в самом runtime-адаптере.
  - Что обязан доказать child: документация больше не обещает устаревшее поведение, а anti-regression guard защищает от возврата drift.

## Правила передачи в child change

- Если документ противоречит наблюдаемому поведению системы, создаётся downstream `fix-*` или `implement-*` change, а не выполняется безымянная редакторская правка.
- Если проблема системная и требует карты всей документационной поверхности, создаётся downstream `producer-*` change.
- Каждый child change, который описывает runtime-контракт, тестовые команды или инженерные правила, обязан содержать capability/scenarios, уровень проверки, команду запуска и требования к mock/credentials при необходимости.

## Открытые вопросы

- Когда документационная линия накопит достаточно разных drift-кейсов, может понадобиться отдельный producer на инвентаризацию и приоритизацию всей surface area.
