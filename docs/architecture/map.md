# Карта архитектуры

## Зачем нужен этот документ

Эта карта нужна `dispatcher-architecture` как рабочий источник истины для downstream changes. Документ не пытается перечислить все папки репозитория. Его задача другая:

- показать текущие архитектурные слои и ключевые сущности;
- связать их с уже существующим кодом и OpenSpec-линиями;
- дать правила, по которым можно принимать новые `implement-*` и `fix-*` changes;
- удерживать границу между архитектурным governance и предметными dispatcher-линиями.

Связанные решения:

- [ADR-0001](./adr/ADR-0001-governance-sources-and-update-rules.md)
- [ADR-0002](./adr/ADR-0002-entity-and-layer-baseline.md)

## Как обновлять карту

Карту нужно обновлять, когда change:

- вводит новую важную сущность;
- меняет место существующей сущности в коде;
- меняет ответственность между крупными слоями;
- добавляет новый architectural boundary, который будет ориентиром для следующих changes.

Карту не нужно переписывать ради локального refactor, если:

- пользовательское поведение не меняется;
- новая сущность не появляется;
- архитектурная граница не становится другой.

## Операционная схема

```text
Product Shell
  -> Project Workspace
    -> Task Catalog / Task Instances
      -> Workflow Instances
        -> Workflow Steps
          -> Workbench Instances
            -> Tools
            -> Prompt Context
            -> Sandpack Preview
            -> Artifacts

Application Services
  -> startTaskLevel
  -> iterateTaskLevel
  -> checkTaskLevel
  -> saveWorkbenchFiles
  -> resetTask

Storage Boundary
  -> project data
  -> user progress
  -> task/workbench artifacts
  -> check-results
  -> event logs

Quality / Governance Layer
  -> OpenSpec changes/specs
  -> ADR registry
  -> architecture map
  -> entity glossary
  -> traceability and tests
```

## Слои и ответственность

### 1. Product Shell

Назначение:

- пользовательские маршруты;
- системные и сервисные экраны;
- внешняя навигация и guards доступа.

Текущее проявление в коде:

- `app/**`
- `app/api/**`
- `lib/auth/**`
- `lib/help/**`
- `lib/system/**`

Граница:

- слой не должен скрывать в себе доменные решения `Project`, `Workflow` или `Workbench`;
- route handlers должны делегировать поведение application services, а не собирать весь runtime сами.

### 2. Project Workspace

Назначение:

- верхний пользовательский scope для dev-mode и будущих импортов;
- место, где сходятся project-level настройки и дальнейшие сущности.

Текущее проявление в коде:

- `lib/project/**`
- связанный runtime и storage в `lib/task/**`

Граница:

- `Project` не должен растворяться в глобальном env/config;
- project-level контракт не должен дублироваться в task/workbench ветках.

### 3. Task / Workflow / Artifact

Назначение:

- описывать пользовательскую работу не как набор файлов, а как управляемый flow;
- связывать входные и выходные артефакты с шагами выполнения.

Текущее проявление в коде:

- `lib/task/**`
- `lib/level/**`
- `lib/onboarding/**`
- `user/tasks/**`, `user/check-results/**`

Граница:

- текущий task-level lab считается частным случаем более общей модели;
- downstream changes не должны насильно фиксировать правило `один шаг = один верстак`.

### 4. Workbench Platform

Назначение:

- дать единый runtime-контур инструментов и состояния рабочей поверхности;
- удерживать preview, файлы, prompt flow и инструменты как связанную сущность.

Текущее проявление в коде:

- `components/desengine/lab/Workbench/**`
- `components/desengine/lab/InOut/**`
- `lib/lab/**`

Граница:

- текущий lab workbench является первым `WorkbenchInstance`, а не вечным special case;
- image tools, layout tools и будущие workbench-расширения должны использовать общий tool contract.

### 5. Prompt / LLM контур

Назначение:

- собирать рабочий контекст для LLM;
- изолировать provider/runtime возможности от пользовательского flow.

Текущее проявление в коде:

- `lib/llm/**`
- `lib/prompt/**`
- `prompts/**`
- `onboarding/prompts/**`

Граница:

- prompt context должен быть общим контрактом для task/workflow/workbench;
- route handlers не должны становиться скрытым владельцем LLM-логики.

### 6. Storage и mutation boundary

Назначение:

- удерживать локальное хранилище как MVP без размазывания `fs`-вызовов по системе;
- подготовить переход к project-scoped storage и event logs.

Текущее проявление в коде:

- `lib/project/storage.ts`
- `lib/task/server-runtime-storage.ts`
- `lib/task/level-reset-storage.ts`
- `lib/onboarding/repository.ts`

Граница:

- смена storage идёт через adapter boundary, а не через массовое переписывание прямых чтений/записей;
- downstream changes должны показывать, где заканчивается mutation boundary.

### 7. Quality / Governance

Назначение:

- удерживать проверяемость архитектурных решений;
- связывать OpenSpec, тестовый слой и архитектурные документы.

Текущее проявление в коде:

- `openspec/**`
- `test/**`
- `docs/architecture/**`

Граница:

- governance не подменяет предметные dispatcher-линии;
- документарный слой должен помогать принимать changes, а не просто описывать желаемое будущее.

## Ключевые сущности и их место

| Сущность | Роль в системе | Где должна проявляться в коде | Tactical owner |
| --- | --- | --- | --- |
| `Project` | верхний scope пользовательской работы | `lib/project/**`, project-scoped storage и bindings | предметная project-линия, при architectural boundary change — `dispatcher-architecture` |
| `Task` | единица пользовательской цели | `lib/task/**`, task catalog и runtime services | предметная task/runtime-линия |
| `WorkflowInstance` | связанный процесс выполнения задачи | workflow bindings и orchestration contracts | предметная workflow-линия |
| `WorkflowStep` | шаг процесса, в котором открывается workbench | step bindings и prompt/runtime orchestration | workflow/workbench линии |
| `WorkbenchInstance` | рабочая поверхность для шага | `components/desengine/lab/Workbench/**`, state и artifact bindings | workbench-линия |
| `WorkbenchTool` | отдельный инструмент внутри верстака | tool registry, applicability, state schema | workbench tool lines |
| `Artifact` | входной или выходной материал работы | task/project storage, preview, prompt context, checks | task/workflow/workbench линии |
| `PromptContext` | единый контекст для LLM-вызова | `lib/prompt/**`, application services | runtime/LLM линии |
| `EventEnvelope` | общий контейнер событий experience/cost/log | event-layer contracts и logs | event/log-system линии |
| `StorageAdapter` | граница доступа к хранилищу | storage services и mutation boundary | runtime/project/storage lines |
| `ApplicationService` | оркестрация user flow без route-level хаоса | `lib/task/actions/**` и соседние service boundaries | runtime-линия |

## Сквозные сущности

Следующие сущности считаются архитектурно сквозными и не должны теряться внутри случайных модулей:

- `код`
- `LLM`
- `бюджет`
- `дизайн`

Правило:

- downstream change не должен вводить новую сквозную сущность без отдельного producer-level решения и обновления словаря/карты.

## Что не считается отдельной сущностью в этой карте

- `AI-трансформация` не является operational-модулем. Это стратегическая рамка producer-линии.
- `сессия работы` пока не выделяется в отдельный слой и считается частью рабочего места.
- `документация` и `Figma` остаются важными внешними опорами, но не становятся отдельными сквозными сущностями этой карты.
- `качество` считается слоем дисциплины, а не бизнесовой сквозной сущностью наравне с кодом, LLM, бюджетом и дизайном.

## Маршрутизация downstream changes

Change должен идти в `dispatcher-architecture`, если его главный результат:

- меняет архитектурную карту;
- вводит или закрывает ADR;
- меняет словарь сущностей;
- закрепляет naming discipline для крупных частей системы;
- вводит модульную границу или контракт взаимодействия между крупными частями системы.

Change не должен автоматически идти в `dispatcher-architecture`, если он в первую очередь:

- меняет runtime поведение lab/task flow;
- вводит domain behavior внутри project/task/workflow/workbench;
- реализует event/log/cost специфику без изменения общей архитектурной карты.

В таких случаях `dispatcher-architecture` остаётся governance-опорой, но tactical owner выбирается по предметной линии.

## Сознательные границы этого документа

Эта карта намеренно не фиксирует:

- детальный routing map;
- naming rules по каталогам и файлам;
- полный boundary-contract между всеми модулями;
- окончательный package layout.

Эти темы должны жить в отдельных downstream governance-артефактах, чтобы карта оставалась рабочим обзором, а не свалкой всех архитектурных деталей.
