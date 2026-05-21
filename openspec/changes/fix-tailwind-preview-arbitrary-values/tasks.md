## Tasks

- [ ] 1. Воспроизвести поведение arbitrary Tailwind values в preview и отделить CSS-problem от layout-problem.
- [ ] 2. Исправить Tailwind/runtime слой или явно зафиксировать supported-contract, если корень в нём.
- [ ] 3. Исправить поведение preview-контейнера, если он растягивает компонент вопреки пользовательскому коду.
- [ ] 4. Добавить unit/source-contract проверки на arbitrary width/height/color classes и на ширину компонента в preview.
- [ ] 5. Обновить OpenSpec delta и traceability-след.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `level-labs`: preview должен честно отображать пользовательский компонент.
- `ui-foundation`: layout preview не должен навязывать ложную ширину.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: желательно, если проблема зависит от реального DOM/CSS.
- integration: не требуется.
- e2e smoke: не требуется на первом шаге.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit && npm run test:traceability`

Mock/fixture-данные и credentials:
- Нужны локальные fixture-компоненты без live credentials.
