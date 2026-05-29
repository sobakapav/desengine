## Контекст

- `spec-coverage-map.json` служит не просто списком, а рабочей матрицей обязательного покрытия для `testing-layer`.
- Сейчас в нём отсутствуют capability `artifacts`, `code-readability`, `image-inspector`, `prompt-context`, `task-model`, `workbench`, `workflow`, хотя соответствующие active specs уже существуют.
- Часть из этих capability уже фигурирует в `@openSpec` metadata тестов, но без записи в coverage-map они не участвуют в явной приоритезации слоя.

## Решение

- Добавить недостающие capability в карту покрытия.
- Для каждого capability выбрать минимально честный набор:
  - `priority`
  - `primaryLevels`
  - `requiredScenarios` или `requiredScenarioGroups`
- Если capability фактически ещё не покрыт полностью, проверить, нужен ли для него `coverage-plan`, а не молчаливый пропуск.

## Риски и компромиссы

- Риск: механически перенести capability в карту без полезной приоритезации.
  - Митигация: брать приоритет и уровни из текущего характера capability и уже существующих тестов, а не только из имени spec.

- Риск: попытка закрыть этим fix всю проблему traceability metadata.
  - Митигация: ограничить scope только полнотой карты покрытия; metadata-gaps оформлять отдельно, если они останутся значимыми.
