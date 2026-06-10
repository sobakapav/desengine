## Why

Сейчас `Project` уже просматривается в preview/UI kit контуре, но ещё не существует как каноническая сущность продукта. Это опасно сразу по нескольким причинам:

- project shape может остаться локальным артефактом лаборатории;
- настройки `uiKitId` / `uiMode` будут жить в частном состоянии, а не в project boundary;
- будущие task/workflow/workbench integrations начнут строиться поверх несовместимых project forms.

`producer-project` требует, чтобы `Project` действительно появился в системе как новый верхний контекст. `producer-architecture-transform` требует, чтобы у такой сущности было явное место и boundary. Значит, первым implement change должен стать canonical `ProjectWorkspace`, а не очередная локальная настройка preview.

## What Changes

- Вводится canonical `ProjectWorkspace` как единый контракт проекта.
- Появляется project registry и active project context.
- Новый проект создаётся минимум с:
  - именем;
  - базовым `UI kit`;
  - project settings, куда входят `uiKitId` и `uiMode`.
- Появляется storage adapter boundary для project-scoped данных без смены storage backend.
- Лаборатория и preview перестают опираться на ad-hoc local project shape и начинают читать active project через canonical boundary.

## Non-goals

- Не вводить `Project Roadmap`.
- Не переносить все task/workflow/workbench/progress данные в project scope за один шаг.
- Не закрывать весь task/workflow/workbench binding внутри этой ветки.
- Не включать project-level `LLM`, `Figma` и `Git/GitHub`.

## Capabilities

### New Capabilities

- `storage-adapter`: project-scoped данные получают явную boundary-модель хранения.

### Modified Capabilities

- `projects`: появляется canonical `ProjectWorkspace`, project registry и active project context.
- `level-labs`: лаборатория начинает читать active project через project boundary.
- `task`: task runtime получает canonical source of truth для project settings, на который можно опирать downstream binding.

## Acceptance Criteria

- В системе есть один canonical `ProjectWorkspace` shape, а не несколько несовместимых project-моделей.
- Пользователь может создать проект минимум с именем и базовым `UI kit`.
- Runtime может определить active project через project registry/boundary.
- `uiKitId` и `uiMode` живут в project settings, а не только в локальном состоянии лаборатории.
- Storage adapter boundary зафиксирован так, чтобы future backend migration не требовала переписывать callers.
- Тестовая часть change явно описывает `static/contract`, `unit` и необходимые browser/integration проверки.
