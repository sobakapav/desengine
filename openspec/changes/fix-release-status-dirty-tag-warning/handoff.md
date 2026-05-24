## Миссия

- Что должен изменить этот change: убрать ложное ощущение нерелизной версии при работе из релизного тега с локальными изменениями
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: [заполнить]
- Кто отвечает за стратегию, тактику и приёмку результата: [заполнить]

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/changes/dispatcher-bugfix/design.md
- openspec/changes/dispatcher-bugfix/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-release-status-dirty-tag-warning: [заполнить]

## Границы исполнения

- Что входит в этот change: [заполнить]
- Что сознательно не входит в этот change: [заполнить]
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: [заполнить]

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: [заполнить]

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: [заполнить]
