## Why

Проекту нужен постоянный стратегический фокус на здоровье кодовой базы и качестве технических решений, чтобы внедренческие changes не размывали архитектурные границы и культуру производства.

## What Changes

- Вводится focus-change `focus-tech` как непрерывный объект заботы о технической стороне проекта.
- Ветки dispatcher/implement могут ссылаться на `focus-tech` как на стратегического родителя или корневой фокус.
- Focus не вносит кодовые изменения напрямую и не заменяет конкретные roadmap-dispatchers.

## Non-goals

- Не реализует feature и runtime-изменения сам по себе.
- Не подменяет собой task-level planning в dispatcher/implement.

## Capabilities

### Modified Capabilities
- `openspec-tooling`: добавлен новый тип стратегического change `focus`.

## Acceptance Criteria

- `focus-tech` отображается в `npm run os` как верхнеуровневый фокус.
- Тип `focus` валидируется схемой и tooling.
