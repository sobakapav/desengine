## Why

Пользовательские жалобы из документа показывают повторяющийся паттерн: LLM предлагает странные или неработающие импорты, а в отдельных задачах система сама подталкивает к компонентам, которые preview/runtime не поддерживает как безопасный контракт.

Подтверждённые источники:
- общий prompt-partial [default-allowed-components.njk](/Users/op/dev/sobakapav/desengine/onboarding/prompts/partials/default-allowed-components.njk) перечисляет `Link`, `Image`, `Script`, `Head`, `Route`, `Routes`, `Outlet`, `Navigate`;
- preview runtime собирается в Sandpack как `create-react-app` sandbox и не содержит `next/link` или router-окружение;
- task hint [mp-inspector-mobile-subject-actions/levels/level-2/tip.md](/Users/op/dev/sobakapav/desengine/onboarding/tasks/mp-inspector-mobile-subject-actions/levels/level-2/tip.md) прямо требует `Link`, что объясняет жалобу на ломающееся preview.

Для пользователя это выглядит как “LLM сошла с ума и упорно тащит некорректные импорты”, хотя часть проблемы создаёт сама система через несовместимый guidance contract.

## What Changes

- Выровнять список рекомендованных компонентов с реально поддерживаемым preview/runtime contract.
- Убрать из общих prompt-guidance те компоненты, которые в текущем task-flow не имеют штатной sandbox-поддержки.
- Переписать task hints, которые требуют неподдерживаемые импорты, на совместимый контракт или добавить runtime support как часть явного change.

## Non-goals

- Не повышать “качество модели вообще”.
- Не добавлять сразу полную поддержку всех React/Next/router-компонентов.
- Не менять didactic intent задач, если его можно сохранить совместимым набором компонентов.

## Impact

- Снизится число ложных и пугающих импортов, которые система сама же провоцирует.
- Task hints и prompt-partials перестанут обещать то, что preview не может исполнить.
