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
    -> Project Components
      -> Workflow Instances
        -> Workflow Steps
          -> Prompt Context
          -> Artifacts
          -> Runtime Readout

Application Services
  -> openProject
  -> startWorkflow
  -> continueWorkflow
  -> persistProjectFiles
  -> readProjectHistory

Storage Boundary
  -> project data
  -> component artifacts
  -> workflow state
  -> project history
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

- верхний пользовательский scope работы;
- место, где сходятся project-level настройки, компоненты и workflow.

Текущее проявление в коде:

- `lib/project/**`
- `components/desengine/project/**`

Граница:

- `Project` не должен растворяться в глобальном env/config;
- project-level контракт не должен дублироваться в параллельных legacy-ветках.

### 3. Workflow Surface

Назначение:

- описывать пользовательскую работу как управляемый project flow;
- связывать шаги, компоненты, историю и результаты выполнения.

Текущее проявление в коде:

- `lib/workflow/**`
- `components/desengine/project/**`

Граница:

- workflow принадлежит проекту, а не отдельному legacy runtime;
- downstream changes не должны возвращать отдельные legacy-маршруты.

### 4. Prompt / LLM контур

Назначение:

- собирать рабочий контекст для LLM;
- изолировать provider/runtime возможности от пользовательского flow.

Текущее проявление в коде:

- `lib/llm/**`
- `lib/prompt/**`
- `prompts/**`

Граница:

- prompt context должен быть общим контрактом для project/workflow;
- route handlers не должны становиться скрытым владельцем LLM-логики.

### 5. Storage и mutation boundary

Назначение:

- удерживать локальное хранилище как MVP без размазывания `fs`-вызовов по системе;
- удерживать project-scoped storage и event logs в явной границе.

Текущее проявление в коде:

- `lib/project/storage.ts`
- `lib/project/**`
- `lib/workflow/**`

Граница:

- смена storage идёт через adapter boundary, а не через массовое переписывание прямых чтений/записей;
- downstream changes должны показывать, где заканчивается mutation boundary.

### 6. Quality / Governance

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
| `ProjectComponent` | рабочая единица внутри проекта | `components/desengine/project/**`, component registry и bindings | предметная project-линия |
| `WorkflowInstance` | связанный процесс проектной работы | workflow bindings и orchestration contracts | предметная workflow-линия |
| `WorkflowStep` | шаг процесса, в котором двигается проектная работа | step bindings и prompt/runtime orchestration | workflow-линия |
| `Artifact` | входной или выходной материал работы | project/workflow storage, runtime readout, prompt context | project/workflow линии |
| `PromptContext` | единый контекст для LLM-вызова | `lib/prompt/**`, application services | runtime/LLM линии |
| `EventEnvelope` | общий контейнер событий experience/cost/log | event-layer contracts и logs | event/log-system линии |
| `StorageAdapter` | граница доступа к хранилищу | storage services и mutation boundary | runtime/project/storage lines |
| `ApplicationService` | оркестрация user flow без route-level хаоса | `lib/project/**`, `lib/workflow/**` и соседние service boundaries | runtime-линия |

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

- меняет runtime поведение project/workflow flow;
- вводит domain behavior внутри project/component/workflow/runtime;
- реализует event/log/cost специфику без изменения общей архитектурной карты.

В таких случаях `dispatcher-architecture` остаётся governance-опорой, но tactical owner выбирается по предметной линии.

## Сознательные границы этого документа

Эта карта намеренно не фиксирует:

- детальный routing map;
- naming rules по каталогам и файлам;
- полный boundary-contract между всеми модулями;
- окончательный package layout.

Эти темы должны жить в отдельных downstream governance-артефактах, чтобы карта оставалась рабочим обзором, а не свалкой всех архитектурных деталей.
