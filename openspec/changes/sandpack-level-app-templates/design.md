## Context

После change `sandpack-lab-preview-runtime` предпросмотр уже рендерится через Sandpack, но `App.tsx` генерируется из одной hardcoded строки в runtime-слое. Это создаёт жёсткую связку:

```text
task progress -> current level -> sandpack route -> shared App.tsx string
```

Для level-specific лабораторий это неудачное место ответственности. `App` template описывает не инфраструктуру Sandpack, а учебный shell конкретного уровня: как обернуть `Component`, что передать ему дополнительно и как организовать preview-плоскость.

## Goals

- Сделать `App` template частью level-owned onboarding-контракта.
- Сохранить общий Sandpack runtime и минимальный blast radius.
- Позволить мигрировать уровни по одному без обязательного массового переноса всех уровней сразу.
- Перевезти уровни 1 и 2 первыми без изменения install-critical инфраструктуры.

## Non-Goals

- Не менять Monaco/workbench/save-flow.
- Не переносить всю логику preview в onboarding-репозиторий без общего runtime-слоя.
- Не менять структуру пользовательских рабочих файлов.
- Не требовать немедленной миграции всех уровней.

## Decision

### 1. Хранить шаблоны рядом с уровнем

Рекомендуемое каноническое место:

```text
onboarding/levels/<levelId>/sandpack/
  App.tsx
  preview.css        # опционально
  README.md          # опционально, для авторов контента
```

Почему так:

- ownership совпадает с уровнем, а не с общим runtime;
- шаблон versioned вместе с `config.json` и `overview.md`;
- будущие различия между уровнями можно держать локально, без роста ветвлений в runtime-коде;
- это продолжает текущий принцип репозитория: внешний onboarding-слой владеет didactic-контрактом уровня.

### 2. Оставить общий runtime в коде приложения

Общий код остаётся в `lib/lab/` и отвечает за:

- сбор `SandpackPreviewPayload`;
- подкладку user files (`Component.tsx`, `styles.ts`, `mock.ts`, `props.ts`);
- подключение shared runtime dependencies и shadcn-файлов;
- генерацию служебных виртуальных файлов (`index.tsx`, `level-template-runtime.ts`, shared preview CSS).

Шаблон уровня не должен знать о файловой системе, route-логике и состоянии доступа. Он получает только стабильные виртуальные импорты.

### 3. Ввести resolver шаблона по уровню

Нужен отдельный слой наподобие:

```text
lib/lab/sandpack-template.ts
  readLevelSandpackTemplate(levelId)
  buildLevelTemplateRuntime(context)
```

Responsibility split:

- `readLevelSandpackTemplate(levelId)` ищет `onboarding/levels/<levelId>/sandpack/App.tsx`;
- если файл есть, возвращает level-owned template и опциональные companion files;
- если файла нет, возвращает shared compatibility template;
- `buildSandpackPreviewPayload(...)` больше не держит `App.tsx` как hardcoded string, а принимает template source извне.

Это позволит внедрять уровни постепенно:

1. сначала выносим current shared template в explicit fallback;
2. потом добавляем `level-1/sandpack/App.tsx`;
3. затем `level-2/sandpack/App.tsx`;
4. дальше остальные уровни едут по одному.

### 4. Дать шаблону только стабильный runtime API

Чтобы level templates не зависели от случайных деталей payload-сборки, шаблону нужно дать небольшой контракт:

```tsx
import Component from "./Component"
import * as mockModule from "./mock"
import { levelRuntime } from "./level-template-runtime"
```

Где `levelRuntime` содержит сериализуемые данные:

- `levelId`
- `levelNumber`
- `labId`
- при необходимости preview-specific flags

Если позже уровню понадобится, например, отдельная layout-плотность, container class или variant-mode, это добавляется в `level-template-runtime.ts`, не ломая пользовательские файлы.

### 5. Первые два уровня переводить без UX-революции

Для первого прохода важно не перепридумывать сами уровни. Миграция уровней 1 и 2 должна:

- сохранить тот же базовый render flow `<Component {...mockProps} />`;
- перенести ownership `App.tsx` из runtime в `onboarding/levels/level-1/sandpack/App.tsx` и `onboarding/levels/level-2/sandpack/App.tsx`;
- оставить пространство для расхождения дальше, когда level 2 начнёт использовать собственную shell-логику.

Это означает, что первые два template initially могут быть очень похожими, но уже жить в разных местах и загружаться по `levelId`.

## Alternatives Considered

### Держать все шаблоны в `lib/lab/templates`

Плюсы:
- проще импортировать и типизировать.

Минусы:
- level-owned дидактика снова уезжает в runtime-код;
- onboarding-слой перестаёт быть каноническим владельцем лаборатории;
- добавление нового уровня требует не только контентного, но и инфраструктурного PR.

### Хранить template source прямо в `onboarding/levels/<levelId>/config.json`

Плюсы:
- меньше файлов.

Минусы:
- JSX/TSX внутри JSON неудобен и хрупок;
- теряются редакторская поддержка, ревью и локальная читаемость;
- companion assets или CSS начинают требовать искусственных escape-слоёв.

## Proposed File/Module Shape

```text
onboarding/levels/level-1/sandpack/App.tsx
onboarding/levels/level-2/sandpack/App.tsx

lib/lab/sandpack-preview.ts            # payload builder, без hardcoded App template
lib/lab/sandpack-template.ts           # resolver level template + fallback
app/api/tasks/[taskId]/sandpack/route.ts
test/unit/sandpack-template.test.ts    # новый unit/contract слой
test/unit/sandpack-preview.test.ts     # обновлённый payload contract
```

## Migration Plan

### Slice 1. Спецификация и runtime contract

- Зафиксировать `level-labs` contract для level-specific Sandpack templates.
- Ввести resolver template по `levelId`.
- Вынести shared hardcoded `App.tsx` в named fallback-template.

### Slice 2. Level 1

- Добавить `onboarding/levels/level-1/sandpack/App.tsx`.
- Подключить template loader для level 1.
- Проверить, что payload и preview не меняются по смыслу.

### Slice 3. Level 2

- Добавить `onboarding/levels/level-2/sandpack/App.tsx`.
- Подключить template loader для level 2.
- Зафиксировать отдельные тесты на выбор template для level 2.

### Slice 4. Cleanup

- Убрать остатки неиспользуемого hardcoded `App.tsx`.
- Обновить authoring notes/README, если понадобится.

## Testing

Затронутые capability/scenarios:

- `level-labs` / "Система выбирает Sandpack App template по уровню задачи"
- `level-labs` / "Уровень 1 использует собственный Sandpack App template"
- `level-labs` / "Уровень 2 использует собственный Sandpack App template"

План проверки:

- `unit/contract`: resolver шаблонов и состав Sandpack payload;
- `component/browser`: локальный smoke preview для задачи на уровнях 1 и 2;
- `traceability`: обновление связей OpenSpec -> tests.

Команды:

- `npm run test:unit -- test/unit/sandpack-preview.test.ts test/unit/sandpack-template.test.ts`
- `npm run test:traceability`

Mock/fixture:

- существующие onboarding-задачи с уровнями 1 и 2;
- live credentials не нужны.

Если browser smoke будет перенесён на следующий шаг, это нужно отдельно отметить в `test/traceability/coverage-plan.json`.
