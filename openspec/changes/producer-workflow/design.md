## Контекст

Сейчас `workflow` уже есть в active specs, но зафиксирован минимально:

- lab level может быть представлен как `WorkflowStepInstance`;
- workflow step может ссылаться на `WorkbenchInstance`.

Этого хватает для проекции текущего состояния, но не хватает для следующей архитектурной волны, где workflow должен стать явной производственной сущностью.

## Goals

- Зафиксировать workflow как first-class процесс продукта.
- Удержать связь workflow с Workbench без подмены одной сущности другой.
- Подготовить tactical owner для downstream workflow-lines.
- Задать readiness criteria для foundation и vertical workflow waves.

## Non-goals

- Не реализовывать engine переходов или orchestration runtime.
- Не навязывать один конкретный workflow всем типам проектной работы.
- Не фиксировать первый workflow как обязательный design artifact прямо сейчас.

## Решение

### 1. Workflow становится видимым процессом

Producer закрепляет, что workflow — это не просто hidden projection из старой модели:

- пользователь должен работать не “с уровнем”, а с фазой или шагом процесса;
- workflow задаёт путь выполнения;
- предмет работы и artifacts живут внутри этого пути, а не рядом с ним;
- workbench materializes текущий шаг или фазу работы.

### 2. Схема контура

Producer использует ту же верхнеуровневую схему, что и `producer-workbench`, но с фокусом на process-layer:

1. `Project` удерживает долгоживущий контекст.
2. `Subject` задаёт конкретный предмет работы и артефакты.
3. `Workflow` задаёт путь движения к результату.
4. `Workbench` materializes конкретную рабочую фазу этого пути.

### 3. `level-labs` считаются legacy-проекцией workflow

Producer закрепляет промежуточное понимание:

- текущая level-модель полезна как исходная legacy-projection;
- она не должна определять долгосрочную форму workflow;
- следующие workflow changes должны уходить от языка уровней к языку шагов, фаз и переходов.

### 4. Tactical ownership отдаётся `dispatcher-workflow`

Producer не ведёт operational backlog сам. Для этого создаётся `dispatcher-workflow`, который будет держать:

- definition/instance model;
- правила переходов;
- user-facing manifestation step/fase;
- sequencing downstream implement/fix changes.

### 5. Критерии readiness следующей волны

Следующая behavior-change волна считается готовой, когда:

- описана минимальная модель `WorkflowDefinition`, `WorkflowInstance`, `WorkflowStep`;
- понятно, как workflow виден пользователю вне level-модели;
- downstream change может явно показать, что он меняет: definition, step manifestation, переходы или vertical workflow slice;
- `dispatcher-workflow` не спорит по ownership с `dispatcher-workbench` и `producer-kill-levels`.

### 6. Временное сужение фокуса

До стабилизации основной product-цепочки producer считает приоритетными только такие workflow-изменения:

- переход из проекта в работу;
- понятный текущий шаг;
- читаемая структура workflow;
- читаемый результат текущей работы.

Другие vertical workflow slices считаются отложенными.

## Риски и компромиссы

- Если workflow останется только технической проекцией lab-уровней, новая модель не проявится в продукте.
- Если producer начнёт проектировать один конкретный vertical workflow вместо общей process-рамки, линия потеряет расширяемость.
- Если workflow и workbench не развести, одна сущность начнёт подменять другую.

## Открытые вопросы

- Один workflow всегда материализуется последовательностью шагов или возможны фазы с вложенной структурой работы.
- Где проходит граница между workflow transitions и статусами предмета работы.
- Какой минимальный user-facing язык использовать вместо старой терминологии уровней.
