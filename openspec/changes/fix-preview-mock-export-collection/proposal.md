# Proposal: fix-preview-mock-export-collection

## Проблема

Sandpack preview ожидает один источник mock-данных (`mockProps` или `mock`) и не умеет рендерить сценарий, где `mock.ts` экспортирует несколько именованных object-констант. В результате пользовательский preview не показывает все подготовленные состояния компонента.

## Что меняется

- preview сначала собирает все object-like named exports из `mock.ts`, кроме `mock`;
- если таких exports нет, preview использует `mock`;
- fallback template и level-owned template используют одинаковый контракт выбора mock-данных.

## Тестирование

- Capability: `level-labs`
- Scenario: система готовит Sandpack App template по уровню задачи
- Scenario: preview рендерит все object-константы из `mock.ts`, если нет явного `mockProps` или `mock`
- Уровень: `unit`
- Команда: `npm run test:unit -- test/unit/sandpack-preview.test.ts test/unit/sandpack-template.test.ts`
