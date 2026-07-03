## Контекст

Active spec-слой уже знает, что workflow существует как модель шагов. Producer-слой следующей волны закрепляет workflow как видимый процесс продукта. Теперь нужен tactical owner, который будет удерживать operational backlog этой линии.

## Goals

- Передать workflow-линии отдельного tactical owner.
- Развести ownership workflow, Workbench и legacy-level transition.
- Подготовить dispatcher к маршрутизации foundation и vertical workflow changes.

## Non-goals

- Не перепроектировать producer-видение workflow.
- Не заменять собой `dispatcher-workbench`.
- Не реализовывать кодовую engine-логику.

## Решение

### 1. Dispatcher держит process-line

`dispatcher-workflow` отвечает за живую тактическую линию процесса:

- definition/instance model;
- semantics переходов;
- user-facing language шагов/фаз;
- связь с Workbench и предметом проектной работы.

### 2. Dispatcher не подменяет Workbench

Если change меняет в первую очередь рабочую поверхность, registry, preview или tool families, он относится к `dispatcher-workbench`. Если change меняет саму process-модель, переходы или то, как пользователю представлен путь работы, это зона `dispatcher-workflow`.

### 3. Dispatcher помогает уводить систему от level-driven модели

Тактическая линия workflow должна отслеживать:

- какие level-driven контракты уже заменены workflow language;
- какие ещё живут как legacy projection;
- где нужны отдельные implement/fix waves, а где достаточно cleanup.

### 4. Текущий приоритет линии

Пока active delivery идёт вокруг основной цепочки `проект -> компоненты -> workflow -> работа`, dispatcher считает приоритетными только:

- шаги и переходы, которые помогают открыть работу из проекта;
- workflow language, который делает текущую работу и её результат понятными;
- cleanup legacy-level формулировок, мешающих этой цепочке.

## Риски и компромиссы

- Если dispatcher не развести с Workbench, downstream changes снова будут спорить за ownership.
- Если workflow оставить без tactical owner, producer быстро превратится в абстрактный текст без operational продолжения.

## Открытые вопросы

- Какая минимальная классификация step kinds нужна первой волне.
- Какие переходы являются обязательными foundation contract, а какие зависят от vertical workflow slice.
