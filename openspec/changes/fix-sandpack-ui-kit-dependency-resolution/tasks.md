# Tasks: fix-sandpack-ui-kit-dependency-resolution

## 1. Контракт и трассируемость

- [x] 1.1 Добавить delta в OpenSpec для capability `task` с требованием runtime-полноты зависимостей выбранного UI kit.
- [x] 1.2 Зафиксировать в change тестовый план для этого behavior-change: unit + traceability, с командами запуска.

## 2. Исправление runtime-конфига

- [x] 2.1 Добавить общий resolver runtime-зависимостей для выбранного Sandpack UI kit (`ant`, `mui`, `shadcn`).
- [x] 2.2 Сохранить обратную совместимость остальных UI kit и текущего API payload.

## 3. Проверки

- [x] 3.1 Добавить unit-тесты на синхронизацию runtime-зависимостей payload с `antd`, `@mui/material` и Radix runtime-графом.
- [x] 3.2 Добавить unit-тест, что payload для `uiKitId=ant` включает критичную зависимость `@rc-component/picker`.
- [x] 3.3 Запустить `npm run test:unit`.
- [x] 3.4 Запустить `npm run test:traceability`.

## 4. Приёмка

- [x] 4.1 Sandpack preview для `uiKitId=ant|mui|shadcn` больше не падает на `ModuleNotFoundError` из-за отсутствия runtime-зависимостей UI kit.
- [x] 4.2 Контракт покрыт автоматическими unit-проверками и включён в общий traceability-слой.
