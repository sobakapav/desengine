## Why

Конвертация отдельного Figma-компонента в базовый React-компонент не должна растворяться внутри общего адаптера импорта проекта. Это не просто способ «затащить данные», а самостоятельный workflow уровня production-потока:

- пользователь хочет взять конкретный UI-элемент;
- быстро получить базовый React-контур;
- дальше доработать его как кодовый артефакт, а не как снимок макета;
- повторять этот путь много раз для разных компонентов.

Поэтому под эту линию нужен не новый `idea`, а сразу отдельный `producer` в `focus-domain`, который закрепит downstream delivery-рамку для workflow «дизайн сразу в коде» на уровне UI-элементов.

## What Changes

- Создаётся `producer-workflow-figma-component-to-react` под `focus-domain`.
- Producer фиксирует отдельный workflow:
  - входом является выбранный Figma-компонент или его variant-set;
  - выходом является базовый React-компонент для дальнейшей ручной и системной доработки;
  - результат не обещает визуально точную копию Figma и не подменяет полноценную дизайн-системную разработку.
- Producer определяет ближайшие downstream delivery-вопросы:
  - как выбирать исходный компонент и его границы;
  - какой базовый React-контракт считается приемлемым результатом;
  - как фиксировать props, variants, slots и структурные ограничения;
  - как связывать результат с дальнейшей работой в `workbench`, `workflow` и `UI kit`.
- Producer удерживает границу с `idea-figma-project-import-adapter`:
  - импорт проекта остаётся отдельной линией;
  - конвертация одного компонента становится самостоятельным workflow и не считается частным случаем массового импорта.
- Producer задаёт тестовую и traceability-рамку для downstream `implement/fix` changes.

## Non-goals

- Не проектировать полный импорт Figma-проекта.
- Не обещать one-click генерацию production-ready компонента.
- Не определять сейчас точную runtime-интеграцию Figma API.
- Не делать кодовую реализацию в рамках этого producer-change.

## Capabilities

### Potentially Modified Capabilities
- `workflow`
- `workbench`
- `projects`

## Impact

- `focus-domain` получает отдельную delivery-линию component-level преобразования из дизайна в код.
- Будущие downstream changes перестают смешивать этот workflow с задачей массового импорта Figma.
- UI-уровень получает более чёткую рамку: важен не импорт ради импорта, а управляемое получение базового React-компонента.

## Acceptance Criteria

- В active OpenSpec есть `producer-workflow-figma-component-to-react` под `focus-domain`.
- В producer явно зафиксировано, что component-level Figma-to-React является отдельным workflow, а не частью общего import adapter.
- В producer описаны минимальные входы, выходы и границы результата.
- В producer зафиксированы downstream delivery-вопросы и тестовая рамка для будущих behavior-change changes.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `workflow`
  - capability: `workbench`
  - capability: `projects`
  - scenario: producer фиксирует отдельный workflow перевода выбранного Figma-компонента в базовый React-компонент и разводит его с линией общего импорта проекта.
- Уровень проверки: `static/contract`.
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются на уровне producer-change.
- Live credentials: не требуются на уровне producer-change.
