# Задача

## Purpose

Зафиксировать контракт устойчивости task-экрана при ошибках preview пользовательского компонента.
## Requirements
### Requirement: Task opening runtime работает внутри active project context

Система SHALL строить task/opening runtime, task screen data и project-aware task actions внутри active project context, а не как безымянный global task flow.

#### Scenario: Пользователь открывает task screen внутри активного проекта
- **WHEN** пользователь открывает задачу при выбранном active project
- **THEN** runtime строит task screen data внутри этого project context
- **AND** task/opening flow не откатывается к project-less global состоянию

#### Scenario: Task runtime сохраняет active project при действиях пользователя
- **WHEN** пользователь выполняет `start`, `iterate`, `check`, `save files`, `reset task` или `reset current level`
- **THEN** runtime, storage binding и route/service boundary используют тот же active project context
- **AND** данные task runtime не смешиваются с project-less fallback вне явного legacy compatibility path

### Requirement: Мутации задачи выполняются через runtime boundary

Система SHALL выполнять локальные мутации состояния одной задачи через последовательную runtime boundary, чтобы параллельные действия пользователя не приводили к lost update или частично применённому состоянию.

#### Scenario: Два действия одновременно меняют одну задачу
- **WHEN** два lab action flow одновременно записывают файлы или progress одного `taskId`
- **THEN** система выполняет эти мутации последовательно
- **AND** итоговое состояние соответствует порядку завершения runtime boundary

#### Scenario: Два действия меняют разные задачи
- **WHEN** lab action flow меняют разные `taskId`
- **THEN** система не блокирует их общей глобальной очередью
- **AND** каждая задача сохраняет собственную последовательность мутаций

#### Scenario: Очередь одной задачи превысила bounded лимит
- **WHEN** для одного `taskId` уже выполняется мутация
- **AND** backlog этой задачи достиг configured budget ожидания
- **THEN** следующее действие получает retriable overload-отказ до постановки в очередь
- **AND** runtime не удерживает лишний pending context для отклонённого действия

#### Scenario: Runtime превысил лимит pending mutation contexts
- **WHEN** несколько task action flow уже заняли глобальный budget pending contexts
- **THEN** следующее действие получает retriable overload-отказ
- **AND** уже принятые мутации продолжают выполняться без corruption очереди

### Requirement: Route handlers используют переиспользуемые lab action services

Система SHALL держать core logic lab action flow в переиспользуемом runtime/service слое, а route handlers использовать как HTTP boundary.
Task service boundary SHALL строить prompt-related runtime context через PromptContext builder, а не через отдельные ad-hoc модели в start/iterate/check flows.

#### Scenario: Пользователь запускает уровень через service boundary
- **WHEN** API route запускает текущий уровень задачи
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется
- **AND** service flow строит PromptContext через общий builder

#### Scenario: Пользователь уточняет задачу через service boundary
- **WHEN** API route выполняет уточняющий prompt по текущему уровню
- **THEN** route handler делегирует LLM-flow, запись файлов и prompt history runtime/service функции
- **AND** HTTP response contract для пользователя не меняется
- **AND** service flow строит PromptContext через общий builder

#### Scenario: Service boundary возвращает явный no-op iterate результат
- **WHEN** API route выполняет уточняющий prompt по текущему уровню
- **AND** runtime не изменил ни один рабочий файл
- **THEN** service boundary возвращает отдельный no-op результат вместо ложного success-сообщения
- **AND** route handler сохраняет этот контракт без ad-hoc переинтерпретации

#### Scenario: Пользователь проверяет результат через service boundary
- **WHEN** API route проверяет результат текущего уровня
- **THEN** route handler делегирует LLM-check, progress mutation и check-result runtime/service функции
- **AND** HTTP response contract для пользователя не меняется
- **AND** service flow строит PromptContext через общий builder

#### Scenario: Hidden check не требует элементы вне task contract
- **WHEN** API route проверяет результат текущего уровня
- **AND** task-specific contract уровня явно запрещает домысливать отсутствующий элемент
- **THEN** hidden check не считает этот элемент обязательным
- **AND** причина провала опирается только на task contract, hidden-check contract и видимые референсы уровня

#### Scenario: Пользователь сохраняет рабочие файлы
- **WHEN** API route сохраняет рабочие файлы задачи
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Пользователь сбрасывает задачу через service boundary
- **WHEN** API route сбрасывает задачу
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Пользователь сбрасывает текущий уровень через service boundary
- **WHEN** API route сбрасывает только текущий уровень
- **THEN** route handler делегирует level-scoped reset отдельной runtime/service функции
- **AND** не переиспользует полный reset задачи как скрытую реализацию

#### Scenario: Пользователь запускает project migration через service boundary
- **WHEN** API route выполняет project `UI kit` migration для текущей задачи
- **THEN** route handler делегирует selective invalidation текущего уровня отдельной runtime/service функции
- **AND** HTTP response contract возвращает обновлённые `taskItem` и `taskData` без полного reset задачи

#### Scenario: Task action runtime возвращает retriable overload-отказ
- **WHEN** `start`, `iterate`, `check`, `save files`, `reset task`, `reset current level` или project migration попадают в bounded overload runtime
- **THEN** service или route boundary возвращает явный retriable error
- **AND** действие не оставляет частично поставленную в очередь мутацию
- **AND** runtime diagnostics фиксирует fast-fail overload path

#### Scenario: Route handlers используют переиспользуемые lab action services
- **WHEN** разработчик меняет route handlers ключевых lab actions
- **THEN** core logic остаётся в `lib/task/actions.ts`
- **AND** route handlers отвечают за access guard, params/body parsing и HTTP response mapping

### Requirement: Task runtime публикует structured speed diagnostics

Система SHALL возвращать для key runtime paths `start`, `iterate`, `check` и task mutation boundary структурированные diagnostics, пригодные для локальной диагностики и downstream speed/load harness.

#### Scenario: Runtime start/iterate/check возвращает structured diagnostics для speed/load путей
- **WHEN** task runtime завершает `start`, `iterate` или `check`
- **THEN** ответ содержит structured diagnostics с `durationMs`, path/stage status и size/load полями
- **AND** diagnostics остаются machine-readable и не сводятся только к текстовому логу

#### Scenario: Runtime boundary помечает очередь мутаций как degradation signal
- **WHEN** task action попадает в очередь `runTaskMutation`
- **THEN** runtime diagnostics фиксирует queue wait и факт сериализации по `taskId`
- **AND** downstream tooling может отличить immediate path от queued/degraded path

### Requirement: Runtime отклоняет oversized write-set до записи пользовательских файлов

Система SHALL проверять итоговый write-set до `ensureUserTaskDir` и до записи рабочих файлов пользователя.
Budget write-set SHALL измеряться по количеству файлов и по суммарному размеру в байтах.

#### Scenario: Runtime отклоняет oversized write-set до записи пользовательских файлов
- **WHEN** `start` или `iterate` сформировали допустимый structured-output, но итоговый write-set превышает runtime budget
- **THEN** система возвращает bounded ошибку с `errorKind=budget`
- **AND** не записывает пользовательские файлы частично

### Requirement: Неконсистентный пользовательский компонент не рушит task-экран

Система SHALL изолировать ошибки пользовательского component preview так, чтобы неконсистентный код компонента не валил task-экран целиком.

#### Scenario: Пользовательский компонент падает во время React-рендера
- **WHEN** task-screen пытается отрендерить пользовательский компонент
- **AND** компонент выбрасывает ошибку во время React-рендера
- **THEN** система не рушит task-экран целиком
- **AND** сохраняет работоспособность окружающего shell-интерфейса

### Requirement: Ошибка preview показывает локальный fallback вместо компонента

Система SHALL при ошибке загрузки, подготовки или React-рендера пользовательского компонента показывать в preview-зоне понятное локальное сообщение об ошибке вместо успешного рендера компонента.

#### Scenario: Ошибка возникает до React-рендера
- **WHEN** система не смогла загрузить, подготовить или валидировать runtime-модуль пользовательского компонента
- **THEN** preview показывает локальное сообщение об ошибке
- **AND** не пытается показать частично сломанный компонент

#### Scenario: Ошибка возникает внутри React-дерева компонента
- **WHEN** runtime-модуль был успешно загружен
- **AND** ошибка возникает уже во время рендера пользовательского компонента
- **THEN** preview заменяет компонент на локальное сообщение об ошибке
- **AND** остальная страница продолжает работать

#### Scenario: Preview принимает UI-импорты из components/ui
- **WHEN** пользовательский компонент импортирует известный UI-компонент из `@/components/ui/*`
- **THEN** preview runtime считает такую UI-зависимость поддерживаемой
- **AND** не показывает ошибку `Неподдерживаемая зависимость`

### Requirement: Пользователь выбирает UI kit для Sandpack preview в настройках

Система SHALL позволять пользователю выбрать, какой UI kit будет подключён в Sandpack preview (глобально для локальной системы), чтобы управлять доступным набором UI-компонентов в виртуальном проекте.

Источник настройки SHALL быть `desengine.config.txt`, параметр `SANDPACK_UI_KIT`.

#### Scenario: По умолчанию включён shadcn/ui
- **WHEN** `SANDPACK_UI_KIT` не задан
- **THEN** preview подключает `shadcn/ui` как активный UI kit

#### Scenario: Пользователь отключает UI kit
- **WHEN** `SANDPACK_UI_KIT=none`
- **THEN** preview не подключает дополнительные UI kit'ы (кроме стандартного React runtime)

#### Scenario: Пользователь включает Ant Design
- **WHEN** `SANDPACK_UI_KIT=ant`
- **THEN** preview подключает Ant Design как активный UI kit

#### Scenario: Пользователь включает Material UI
- **WHEN** `SANDPACK_UI_KIT=mui`
- **THEN** preview подключает Material UI как активный UI kit

### Requirement: API картинок задачи использует единый канонический endpoint

Система SHALL отдавать картинки задачи через единый endpoint `GET /api/tasks/:taskId/image` с параметром `imageId`.

#### Scenario: Клиент запрашивает картинку варианта
- **WHEN** клиент делает запрос `GET /api/tasks/:taskId/image?imageId=variants`
- **THEN** система возвращает соответствующую PNG-картинку

#### Scenario: Клиент пытается использовать удалённый дублирующий endpoint
- **WHEN** клиент делает запрос `GET /api/tasks/:taskId/images/:imageId`
- **THEN** система не предоставляет этот дублирующий endpoint
- **AND** каноническим остаётся только `GET /api/tasks/:taskId/image`

### Requirement: Sandpack preview использует настройки проекта

Система SHALL собирать Sandpack preview с учётом `project.settings.uiKitId` и `project.settings.uiMode`, чтобы preview можно было переключать на уровне проекта без смены глобального стека.

#### Scenario: Sandpack preview использует project.uiKitId
- **WHEN** клиент запрашивает Sandpack payload с `project.settings.uiKitId` и `project.settings.uiMode=ui-kit`
- **THEN** preview builder подключает UI kit из project settings
- **AND** список kit'ов берётся из единого Sandpack UI kit config
- **AND** существующие shadcn/ui-импорты не заменяются html-tags fallback'ом

#### Scenario: Preview фиксирует exact installed версии runtime-зависимостей
- **WHEN** preview builder собирает dependency graph для Sandpack payload
- **THEN** прямые runtime-зависимости берутся по фактически установленным версиям пакетов, а не по плавающим semver-диапазонам из корневого `package.json`
- **AND** payload не должен дрейфовать на несовместимый набор UI runtime-пакетов при повторной установке preview-зависимостей

#### Scenario: Режим html-tags работает без UI kit
- **WHEN** `project.settings.uiMode=html-tags` и `project.settings.uiKitId=none`
- **THEN** Sandpack payload содержит только базовые React-зависимости
- **AND** HTML JSX-теги рендерятся без дополнительных UI kit-пакетов

#### Scenario: Preview показывает безопасный fallback при несовместимости проекта
- **WHEN** компонент использует UI kit-импорты или абстрактные JSX-компоненты в режиме `html-tags`
- **THEN** preview builder возвращает безопасный fallback-компонент и статус несовместимости
- **AND** лаборатория продолжает работать

#### Scenario: Preview поднимает runtime-ошибку Sandpack в host UI
- **WHEN** Sandpack payload совместим с проектом
- **AND** выбранный UI kit или компонент падает после запуска preview
- **THEN** `project.compatibility` остаётся `compatible`
- **AND** лаборатория показывает host-level runtime-диагностику рядом с preview

#### Scenario: Preview показывает безопасный fallback для Server Actions
- **WHEN** пользовательский компонент или локально импортированный preview-файл использует Next.js Server Actions
- **THEN** Sandpack preview не пытается исполнять этот код как штатный runtime-path
- **AND** builder возвращает безопасный fallback-компонент с человекочитаемой диагностикой
- **AND** structured diagnostics помечает ветку причиной `unsupported_preview_api`

#### Scenario: Preview игнорирует stale runtime contract messages
- **WHEN** текущий preview уже поднят для активного project/task-сеанса
- **AND** host получает runtime contract message без `previewSessionId` или с чужим `previewSessionId`
- **THEN** лаборатория игнорирует это сообщение
- **AND** host-level runtime-диагностика текущего preview не переключается на чужой status

#### Scenario: Preview применяет Tailwind arbitrary values и ширину компонента
- **WHEN** компонент preview или подключённый UI-компонент использует Tailwind utility classes, включая arbitrary values и width-утилиты
- **THEN** Sandpack preview компилирует эти классы внутри виртуального проекта без CDN-заглушек
- **AND** компонент получает ожидаемую ширину и стили в preview

### Requirement: Task-specific подсказки уровня поддерживают статичный и шаблонный формат

Система SHALL читать task-specific подсказку уровня из каталога задачи и поддерживать как статичный Markdown, так и шаблон Nunjucks, совместимый с prompt templates.

#### Scenario: Система читает статичную task-specific подсказку уровня
- **WHEN** в каталоге задачи есть `levels/<levelId>/tip.md`
- **AND** рядом нет `tip.njk`
- **THEN** runtime возвращает содержимое `tip.md` как статичный текст

#### Scenario: Система рендерит шаблонную task-specific подсказку уровня
- **WHEN** в каталоге задачи есть `levels/<levelId>/tip.njk`
- **THEN** runtime рендерит подсказку через общий Nunjucks template runtime
- **AND** template context содержит данные задачи и уровня

#### Scenario: Шаблонная task-specific подсказка учитывает выбранный UI kit проекта
- **WHEN** пользователь меняет `project.settings.uiKitId` в лаборатории
- **AND** подсказка уровня описана как `tip.njk`
- **THEN** Workbench запрашивает подсказку с текущими настройками проекта
- **AND** template context содержит название выбранного UI kit

#### Scenario: Шаблонная подсказка имеет приоритет над статичной
- **WHEN** в каталоге задачи есть и `tip.njk`, и `tip.md`
- **THEN** runtime использует `tip.njk`

#### Scenario: Шаблон подсказки содержит ошибку
- **WHEN** runtime не может отрендерить `tip.njk`
- **THEN** подсказка возвращается как raw template fallback
- **AND** task runtime продолжает работать

#### Scenario: Подсказка уровня отсутствует
- **WHEN** в каталоге задачи нет `tip.njk` и `tip.md`
- **THEN** runtime возвращает пустую строку

#### Scenario: Task-specific подсказка не требует неподдерживаемый preview runtime
- **WHEN** task-specific подсказка объясняет рекомендуемые компоненты или импорты
- **THEN** она опирается на текущий preview/runtime contract
- **AND** не требует framework/router-компоненты, для которых preview не поднимает штатное окружение

### Requirement: Task runtime предоставляет read-only projection в доменную модель

Система SHALL предоставлять read-only projection текущих lab task данных в `TaskInstance`, `WorkflowInstance` и `Artifact` без изменения формата хранения.

#### Scenario: Текущий runtime совместим с task-model projection
- **WHEN** runtime имеет `TaskData`, progress, prompt history и check-result
- **THEN** projection строит доменные сущности task/workflow/artifact
- **AND** runtime не мигрирует storage и не создаёт второй независимый file-set contract
