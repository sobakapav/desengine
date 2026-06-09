## Tasks

- [ ] 1. Зафиксировать `producer-workflow-figma-component-to-react` под `focus-domain`.
- [ ] 2. Описать workflow как отдельный component-level процесс, а не как подпоток общего импорта Figma-проекта.
- [ ] 3. Зафиксировать минимальный контракт результата:
  - [ ] 3.1 входом является выбранный Figma-компонент или variant-group;
  - [ ] 3.2 выходом является базовый React-компонент;
  - [ ] 3.3 результат считается scaffold-артефактом для дальнейшей доработки.
- [ ] 4. Развести границы с `idea-figma-project-import-adapter`.
- [ ] 5. Описать downstream delivery-вопросы:
  - [ ] 5.1 выбор и нормализация входного компонента;
  - [ ] 5.2 контракт JSX/props/variants;
  - [ ] 5.3 связка с `workbench` и preview;
  - [ ] 5.4 будущая интеграция с project `UI kit`, если она понадобится.
- [ ] 6. Подготовить тестовую и traceability-рамку для будущих behavior-change changes.
- [ ] 7. Выполнить проверку по `verification_command` из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить downstream-записи в `test/traceability/coverage-plan.json`, если конкретное покрытие будет отложено в последующих behavior-change changes.
