## Why

Нужен отдельный стратегический фокус на режиме онбординга и его контенте, чтобы его развитие не растворялось в технических и feature-ветках.

## What Changes

- Вводится `focus-onboarding` как долгоживущий стратегический контур.
- Ветки, связанные с onboarding flow и onboarding content, могут привязываться к этому фокусу.

## Non-goals

- Не вносит runtime-изменения в продукт сам по себе.
- Не подменяет конкретные dispatcher/research/implement changes, которые должны отдельно фиксировать поведение и тестовое покрытие.
- Не меняет install-critical стек и не навязывает техническую реализацию onboarding-потока.

## Capabilities

### New Capabilities

- Нет.

### Modified Capabilities

- Прямых delta-spec нет: `focus-onboarding` не меняет действующие пользовательские контракты сам по себе, а задаёт стратегический контур для связанных capabilities onboarding-направления, включая `onboarding-repo` и контентные сценарии помощи/подсказок.

## Impact

- Иерархия OpenSpec changes вокруг onboarding-направления.
- Приоритизация dispatcher/research/implement changes, относящихся к onboarding flow и onboarding content.
- Требование держать поведенческие изменения onboarding-направления в явной связи с OpenSpec и тестовым слоем.

## Acceptance Criteria

- `focus-onboarding` отображается в `npm run os:tree` как верхнеуровневый стратегический фокус.
- Changes, относящиеся к onboarding flow и onboarding content, могут использовать `focus-onboarding` как `parent_change` или `strategy_root` в допустимых схемой случаях.
- `focus-onboarding` фиксирует границы своего контура: onboarding runtime, onboarding content, help/prompt/hints-направления и связанные изменения UX первого прохождения.
