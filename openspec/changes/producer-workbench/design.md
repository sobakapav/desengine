## Контекст

Существующий active слой уже знает несколько важных вещей:

- `projects` вводят `ProjectWorkspace` как канонический project scope;
- `workflow` уже проявляется как `WorkflowInstance` и `WorkflowStepInstance`;
- `workbench` уже описан через `WorkbenchDefinition` и `WorkbenchInstance`;
- текущая UX-модель по-прежнему сильно завязана на `level-labs`.

Следующая волна архитектурной трансформации требует не просто “улучшить верстак”, а ответить, становится ли он центром рабочей модели системы.

## Goals

- Зафиксировать Workbench как materialized, но пока locked рабочую поверхность продукта.
- Описать схему следующего рабочего контура системы.
- Зафиксировать, что отказ от `level-labs` должен идти через Workbench, а не через изолированный routing cleanup.
- Передать tactical ownership существующему `dispatcher-workbench`.
- Задать критерии readiness для foundation и implementation waves.

## Non-goals

- Не определять все будущие tool families до мелочей.
- Не реализовывать новый user flow кодом.
- Не фиксировать первый конкретный workflow как обязательный design artifact прямо сейчас.

## Решение

### 1. Workbench materialized как отдельная рабочая поверхность

Workbench больше не должен пониматься как частный “экран лаборатории”. Producer закрепляет другой смысл:

- пользователь работает не “в лаборатории”, а в Workbench;
- Workbench уже materializes один шаг workflow или отдельную рабочую фазу внутри него;
- Workbench пока открыт только как locked shell и не становится главным местом действий раньше времени;
- Workbench связан с `project`, `workflow`, `subject` и артефактами как с отдельными сущностями.

### 2. Схема следующего контура

Producer фиксирует рабочую схему:

1. `Project` задаёт долгоживущий контекст работы.
2. `Workflow` задаёт путь движения к результату.
3. `Subject` задаёт конкретный предмет работы внутри проекта.
4. `Workbench` даёт конкретную рабочую поверхность, в которой пользователь проходит шаг workflow или фазу работы.

Эта схема нужна не как декоративная диаграмма, а как критерий для downstream changes: изменение не должно одновременно притворяться project model, workflow engine и lab shell, если оно реально отвечает только за один слой.

### 3. `level-labs` считаются legacy-моделью

Producer не убивает лаборатории сам, но фиксирует архитектурное решение:

- `level-labs` не являются долгосрочной целевой моделью;
- lab-экран рассматривается как ранняя materialization будущего Workbench;
- отказ от лабораторий должен идти через проявление новой workbench-модели, а не через чисто косметический демонтаж маршрутов.

### 4. Tactical ownership отдаётся `dispatcher-workbench`

Producer отвечает за общий смысл и sequencing. Tactical owner для downstream backlog остаётся один:

- `dispatcher-workbench` ведёт контракт `WorkbenchDefinition/Instance`;
- `dispatcher-workbench` ведёт registry и tool families;
- `dispatcher-workbench` принимает downstream implement/fix waves по runtime, preview, layout и navigation.

### 5. Критерии readiness следующей волны

Следующая behavior-change волна считается готовой к запуску, когда:

- понятен user-facing смысл Workbench без опоры на термин “лаборатория”;
- описано, как открывается Workbench для project/workflow/subject context;
- описано, где заканчивается foundation Workbench и начинается конкретный workflow-specific UX;
- downstream change может явно указать, меняет ли он `project`, `workflow`, `workbench`, `subject` или только tool/runtime слой;
- `dispatcher-workbench` получил producer-контекст и не конкурирует за стратегию с `producer-kill-levels` и `producer-workflow`.

### 6. Временное сужение фокуса

До стабилизации основной цепочки `проект -> компоненты -> workflow -> работа` эта линия не форсирует:

- отдельные новые tool families;
- layout/space как самостоятельный UX-контур;
- image inspector как отдельную волну;
- широкую навигационную переработку вне текущей рабочей сессии.

Workbench сейчас рассматривается только как поверхность, которая помогает увидеть каркас связей и подготовить следующий продуктовый слой без допуска к реальной работе на нём.

## Риски и компромиссы

- Если не закрепить Workbench как главную поверхность, workflow будет снова растворяться в ad-hoc экранах.
- Если producer сразу полезет в детали первого workflow, Workbench-линия станет заложником одного vertical slice.
- Если `level-labs` убивать без новой workbench-модели, система получит переход без новой рабочей логики.

## Открытые вопросы

- Один workflow step всегда должен materialize отдельный Workbench или возможны несколько шагов в одной рабочей поверхности.
- Какие части текущего lab UX можно считать прямыми кандидатами на сохранение в Workbench, а какие — нет.
- Где именно проходит граница между Workbench navigation и Workflow navigation.
