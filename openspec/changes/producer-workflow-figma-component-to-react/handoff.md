## Миссия

- Что должен изменить этот change: оформить отдельный producer-контур workflow перевода выбранного Figma-компонента в базовый React-компонент и явно развести эту линию с общим импортом Figma-проекта.
- Этот change не меняет код напрямую и не подменяет собой downstream dispatcher/implement ветки.

## Унаследованный контекст

- parent_change: focus-domain
- strategy_root: focus-domain
- roadmap_ref: producer-workflow-figma-component-to-react/roadmaps/figma-component-to-react.md
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-domain` уже владеет producer- и dispatcher-линиями доменных сущностей и workflow-контуров, если они становятся самостоятельными delivery-направлениями.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию доменного контура держит `focus-domain`, смежную продуктовую идею импорта удерживает `idea-figma-project-import-adapter`, а тактика и состав downstream delivery для component-level Figma-to-React workflow принадлежат этому producer-change.

## Обязательные источники

- openspec/changes/focus-domain/proposal.md
- openspec/changes/idea-figma-project-import-adapter/proposal.md
- openspec/changes/idea-figma-project-import-adapter/design.md
- openspec/specs/projects/spec.md
- openspec/specs/workflow/spec.md
- openspec/specs/workbench/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для producer-workflow-figma-component-to-react: active changes и спецификации, связанные с component workflow, `UI kit`, preview и project-scoped workbench.

## Границы исполнения

- Что входит в этот change: рамка отдельного workflow, минимальный контракт результата, граница с import adapter, карта downstream delivery-вопросов, тестовая и traceability-готовность для последующих behavior-change веток.
- Что сознательно не входит в этот change: общий импорт Figma-проекта, runtime/Figma API реализация, production-ready генерация компонентов, точная визуальная репликация Figma.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `focus-domain` уже задаёт доменную topology; `idea-figma-project-import-adapter` уже владеет линией общего импорта внешнего дизайн-материала в проект.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: новый producer корректно встроен в active OpenSpec topology под `focus-domain`, имеет собственный roadmap, не смешивает component-level workflow с import adapter и задаёт проверяемую рамку для downstream behavior-change веток.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какой shape базового React-результата является обязательным; как нормализуются variants и props; в каком порядке downstream ветки разделят входной компонент, React scaffold и preview/workbench binding.
