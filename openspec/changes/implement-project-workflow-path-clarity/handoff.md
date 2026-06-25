## Миссия

- Что должен изменить этот change: Сделать путь проект -> компонент -> workflow -> работа понятнее в пользовательском интерфейсе
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: producer-architecture-transform
- strategy_root: producer-architecture-transform
- release_ref: (не задан)
- producer_ref: producer-architecture-transform
- Что из родительского change уже решено: линия обязана проявляться в интерфейсе; ближайшие приоритеты - `Проекты`, путь `проект -> компонент -> workflow -> работа` и очистка пользовательского слоя от внутренней инженерной лексики.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию этой линии удерживает `producer-architecture-transform`; этот implement-change делает конкретный UX-срез в project/task surfaces; внешнюю приёмку и финальную verification выполняет другой агент или пользователь.

## Обязательные источники

- openspec/changes/producer-architecture-transform/proposal.md
- openspec/changes/producer-architecture-transform/design.md
- openspec/changes/producer-architecture-transform/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-workflow-path-clarity: `components/desengine/project/ProjectOverviewScreen.tsx`, `components/desengine/project/ProjectComponentsPanel.tsx`, `components/desengine/project/TaskProjectComponentContext.tsx`, `components/desengine/task/TaskScreen.tsx`, `components/desengine/project/projectSurface.ts`, `test/unit/project-component-registry-surface.test.ts`, `test/unit/workflow-component-aware-surface-labels.test.ts`, `test/unit/project-task-assignment-surface.test.ts`.

## Границы исполнения

- Что входит в этот change: уточнение текстов, маршрута и surface labels на project/task экранах; более понятное описание пути `проект -> компонент -> работа`; обновление unit-тестов этих surface-контрактов.
- Что сознательно не входит в этот change: новая архитектурная панель; новый route; изменение storage/backend; изменение workflow engine; redesign Workbench целиком.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: producer уже определил приоритет пользовательского эффекта, список главных обещаний линии и запрет на обязательную отдельную architecture-transform панель.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: пользовательский путь на project/task surfaces стал понятнее; тексты и статусы меньше завязаны на внутренний workflow-жаргон; проект, компонент и рабочая сессия читаются как связанный маршрут.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие тексты уже достаточно понятны и не требуют трогать их лишний раз; какие surface labels стоит упростить без потери связи с существующей моделью данных.
