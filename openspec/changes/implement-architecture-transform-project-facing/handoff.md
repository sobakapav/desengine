## Миссия

- Что должен изменить этот change: Реализовать первый пользовательский слой architecture-transform на странице проекта: показать архитектурную линию, текущие аттракторы, ограничения рабочей модели и ближайшие архитектурные шаги в явной project-facing панели.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: producer-architecture-transform
- strategy_root: producer-architecture-transform
- release_ref: (не задан)
- producer_ref: producer-architecture-transform
- Что из родительского change уже решено: архитектурная трансформация признана пользовательски значимой линией; список сквозных аттракторов ограничен `кодом`, `LLM`, `бюджетом` и `дизайном`; `AI-трансформация` остаётся vision-рамкой; `сессия работы` пока остаётся частью `рабочего места`; `верстак` не приравнивается автоматически к одному шагу.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию линии и допустимые смыслы удерживает `producer-architecture-transform`; этот implement-change отвечает только за первый project-facing UI-срез; внешнюю приёмку и verification выполняет другой агент или пользователь.

## Обязательные источники

- openspec/changes/producer-architecture-transform/proposal.md
- openspec/changes/producer-architecture-transform/design.md
- openspec/changes/producer-architecture-transform/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-architecture-transform-project-facing: `openspec/specs/architecture-transform/spec.md`, `components/desengine/project/ProjectOverviewScreen.tsx`, `components/desengine/project/projectSurface.ts`, `test/unit/project-user-surface-foundation.test.ts`, `test/traceability/coverage-plan.json`.

## Границы исполнения

- Что входит в этот change: project-facing architecture panel на странице проекта; surface/model для неё; синхронизация active spec и traceability evidence.
- Что сознательно не входит в этот change: новый route; отдельный архитектурный реестр; editable architecture editor; новые backend endpoints; пересмотр списка аттракторов или смысла `AI-трансформации`.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: архитектурная линия уже признана product-facing; список аттракторов ограничен четырьмя сущностями; `AI-трансформация` не становится отдельной operational сущностью; install-critical стек не меняется.

## Проверка результата

- verification_level: static/contract + unit
- verification_command: npm run test:traceability && npm run test:unit -- project-user-surface-foundation architecture-transform-project-facing
- Что именно должен доказать результат проверки: project overview действительно поднимает architecture-transform как отдельный пользовательский слой; surface/model не искажает аттракторы и ограничения producer-линии; capability `architecture-transform` получает runnable evidence и исчезает из coverage-plan.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: как сделать панель практичной для пользователя уже сейчас, не превращая её в абстрактную governance-справку; как дать traceability evidence всем active сценариям capability без искусственного раздутия тестового слоя.
