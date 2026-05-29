## Контекст

Сейчас guidance-слой и runtime-слой живут в разных реальностях. Prompt-partials разрешают и поощряют ряд React/Next/router-компонентов, но preview builder собирает пользовательский код в CRA-based Sandpack without Next/router runtime. Из-за этого пользователь может сделать “правильно” по текстовой подсказке и сразу получить сломанный preview.

Частный пример `mp-inspector-mobile-subject-actions` показывает, что это не абстрактная архитектурная проблема, а прямой user-facing defect. Задача учит избегать голого `<a>` и требует `Link`, хотя sandbox не умеет его исполнять.

## Решение

1. Определить canonical supported component set для текущего task/prompt/preview flow.
2. Сопоставить ему:
   - общий partial `default-allowed-components.njk`;
   - task-specific hints;
   - preview compatibility guards.
3. Для неподдерживаемых компонентов выбрать один из путей:
   - убрать из guidance;
   - заменить на совместимую рекомендацию;
   - либо явно добавить runtime support отдельным scoped change.
4. Добавить тест, который связывает prompt guidance и preview/runtime contract, чтобы новые неподдерживаемые компоненты не просачивались в onboarding снова.

## Проверочный слой

- Затронутые capability/scenario:
  - `llm` / системный guidance для start- и iterate-flow;
  - `task` / preview compatibility и безопасный fallback;
  - onboarding hints для задач уровня.
- Уровень проверки: `unit`.
- Команда: `npm run test:unit -- test/unit/prompt-component-guidance-runtime-parity.test.ts`

Если часть работы будет вынесена в отдельный runtime-support change, этот fix всё равно должен оставить после себя проверяемый guardrail на текущий поддерживаемый набор компонентов.
