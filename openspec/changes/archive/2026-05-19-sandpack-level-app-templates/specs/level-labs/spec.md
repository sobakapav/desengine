## ADDED Requirements

### Requirement: Лаборатория выбирает Sandpack App template по уровню задачи

Система SHALL определять `App` template для Sandpack preview по `levelId` текущей лаборатории задачи, а не использовать единственный жёстко зашитый общий шаблон для всех уровней.

#### Scenario: Система собирает preview для начатой задачи
- **WHEN** preview route готовит Sandpack payload для задачи на уровне `L`
- **THEN** система определяет текущий `levelId`
- **AND** подбирает `App` template, принадлежащий этому уровню

### Requirement: Шаблон Sandpack preview принадлежит onboarding-уровню

Система SHALL хранить level-specific Sandpack `App` template рядом с данными уровня в onboarding-слое.

#### Scenario: Система загружает template уровня
- **WHEN** для уровня существует собственный Sandpack template
- **THEN** система читает его из `onboarding/levels/<levelId>/sandpack/App.tsx`
- **AND** использует этот template как виртуальный `/App.tsx` в preview-проекте

### Requirement: Неперевезённые уровни сохраняют совместимость через shared fallback

Система SHALL на время поэтапной миграции поддерживать совместимый shared fallback-template для уровней, у которых ещё нет собственного `sandpack/App.tsx`.

#### Scenario: Уровень ещё не имеет собственного template
- **WHEN** preview route готовит Sandpack payload для уровня без файла `onboarding/levels/<levelId>/sandpack/App.tsx`
- **THEN** система использует совместимый shared fallback-template
- **AND** не ломает preview только из-за отсутствия level-specific template

### Requirement: Уровень 1 использует собственный Sandpack App template

Система SHALL предоставлять уровню 1 отдельный Sandpack `App` template.

#### Scenario: Пользователь открывает задачу уровня 1
- **WHEN** preview route готовит Sandpack payload для задачи на уровне 1
- **THEN** виртуальный `/App.tsx` берётся из `onboarding/levels/level-1/sandpack/App.tsx`

### Requirement: Уровень 2 использует собственный Sandpack App template

Система SHALL предоставлять уровню 2 отдельный Sandpack `App` template.

#### Scenario: Пользователь открывает задачу уровня 2
- **WHEN** preview route готовит Sandpack payload для задачи на уровне 2
- **THEN** виртуальный `/App.tsx` берётся из `onboarding/levels/level-2/sandpack/App.tsx`
