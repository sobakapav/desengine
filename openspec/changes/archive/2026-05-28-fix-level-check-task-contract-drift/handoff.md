## Миссия

- Что должен изменить этот change: устранить drift hidden check относительно task contract, чтобы проверка не требовала отсутствующие элементы и не возвращала плавающие причины провала.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: parent dispatcher уже зафиксировал необходимость искать реальный источник user-facing дефекта, а не списывать его на “неудачную формулировку жалобы”. В этом кейсе source-level анализ подтвердил: задача `otvinta-badge-counter` не требует колокольчик, а hidden check не имеет достаточного task-specific stabilizer.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-bugfix`; этот fix отвечает за contract и стабильность level check.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/llm/spec.md
- openspec/specs/task/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-level-check-task-contract-drift: `onboarding/tasks/otvinta-badge-counter/base.png`, `onboarding/tasks/otvinta-badge-counter/variants.png`, `onboarding/tasks/otvinta-badge-counter/levels/level-1/tip.md`, `onboarding/prompts/levels/level-1/check.njk`, `lib/task/actions/check.ts`, `lib/task/prompt-context.ts`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: закрепить приоритет task contract над модельной интерпретацией wireframe, стабилизировать hidden check как минимум для кейса `otvinta-badge-counter`, определить механизм task-specific check context/rubric.
- Что сознательно не входит в этот change: полный отказ от LLM-проверки, массовый redesign всех hidden checks, переработка самих task assets без отдельного доказательства.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: bugfix не должен расширять задачу новыми обязательными элементами ради согласования с текущим ложным валидатором.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/task-check-contract-drift.test.ts
- Что именно должен доказать результат проверки: hidden check больше не придумывает обязательные элементы, отсутствующие в task contract/wireframe; повторные проверки одного и того же кода возвращают согласованный основной дефект.

## Открытые вопросы

- Достаточно ли task-specific rubric для отдельных задач или нужен более общий contract layer между hints, assets и check-flow.
- Как фиксировать порядок приоритета нескольких причин провала, чтобы результат был повторяемым и человеко-понятным.
