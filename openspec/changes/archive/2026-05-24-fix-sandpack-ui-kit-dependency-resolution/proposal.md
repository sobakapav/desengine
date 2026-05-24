# Change: fix-sandpack-ui-kit-dependency-resolution

## Зачем

В Sandpack preview возможны runtime-ошибки вида `ModuleNotFoundError`, когда внутренние зависимости выбранного UI kit не попали в sandbox dependencies.

Для пользователя это выглядит как «preview сломан», хотя задача и код корректны. Нужно убрать этот класс отказов системно, а не точечным добавлением одной зависимости.

## Что меняется

- Фиксируется контракт: Sandpack UI kit обязан поставлять полный runtime-набор зависимостей, необходимых для резолва импортов выбранного UI kit.
- Вводится общий resolver runtime-зависимостей для всех UI kit (`ant`, `mui`, `shadcn`) на основе установленного dependency-графа пакетов.
- Добавляются тест-контракты на синхронизацию generated payload с runtime-зависимостями `antd`, `@mui/material` и Radix-пакетов shadcn.

## Что не входит

- Оптимизация размера dependency-графа Sandpack.
- Автоматическое подтягивание зависимостей из сети во время runtime приложения.

## Пользовательский эффект

- Preview с Ant Design, Material UI и shadcn/ui стабильно открывается без ошибок резолва внутренних модулей.
- Снижается риск «случайных» падений preview после обновления `antd`.

## Затронутая область

- Конфигурация и runtime-resolver Sandpack UI kit.
- Генерация payload для preview.
- Unit/traceability слой проверки контракта UI kit runtime-зависимостей.
