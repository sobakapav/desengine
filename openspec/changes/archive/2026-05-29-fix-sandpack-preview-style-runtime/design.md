## Контекст

Существующий preview contract заявляет поддержку Tailwind classes и runtime diagnostics, но пользовательские жалобы указывают на две разные поломки:
1. DOM рендерится, но стили не применяются.
2. Preview runtime периодически падает или становится нестабильным.

Обе проблемы нельзя надёжно закрыть только unit-тестом на builder payload, потому что payload может содержать `styles.css`, `postcss.config.js` и `tailwind.config.js`, а реальный браузерный sandbox всё равно не применит эти стили.

## Решение

1. Зафиксировать browser-level preview contract:
   - Tailwind utility classes действительно видны в computed style;
   - level `preview.css` подключается поверх базового CSS;
   - runtime error показывает диагностический state, а не “тихий пустой рендер”.
2. Развести классы сбоев:
   - sandbox bundler failure;
   - CSS compilation failure;
   - component compatibility failure.
3. Для каждого класса сбоя определить понятный user-facing fallback или remediation message.
4. Добавить e2e/browser verification на реальный styled preview.

## Проверочный слой

- Затронутые capability/scenario:
  - `task` / preview применяет Tailwind arbitrary values и ширину компонента;
  - `level-labs` / лаборатория показывает runtime-диагностику Sandpack preview;
  - `ui-foundation` / рискованный render-островок изолирован boundary/fallback.
- Уровень проверки: `component/browser`.
- Команда: `npm run test:e2e -- test/e2e/sandpack-preview-style-runtime.spec.ts`

Если браузерный runtime-слой пока нестабилен во внешнем окружении, это должно быть явно отражено в coverage-plan как технический долг, а не скрыто за зелёным unit payload builder.
