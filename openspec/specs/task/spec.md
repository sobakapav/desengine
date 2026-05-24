# Задача

## Purpose

Зафиксировать контракт устойчивости task-экрана при ошибках preview пользовательского компонента.
## Requirements
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

#### Scenario: Пользователь проверяет результат через service boundary
- **WHEN** API route проверяет результат текущего уровня
- **THEN** route handler делегирует LLM-check, progress mutation и check-result runtime/service функции
- **AND** HTTP response contract для пользователя не меняется
- **AND** service flow строит PromptContext через общий builder

#### Scenario: Пользователь сохраняет рабочие файлы
- **WHEN** API route сохраняет рабочие файлы задачи
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Пользователь сбрасывает задачу через service boundary
- **WHEN** API route сбрасывает задачу
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется

#### Scenario: Route handlers используют переиспользуемые lab action services
- **WHEN** разработчик меняет route handlers ключевых lab actions
- **THEN** core logic остаётся в `lib/task/actions.ts`
- **AND** route handlers отвечают за access guard, params/body parsing и HTTP response mapping

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

### Requirement: Task runtime предоставляет read-only projection в доменную модель

Система SHALL предоставлять read-only projection текущих lab task данных в `TaskInstance`, `WorkflowInstance` и `Artifact` без изменения формата хранения.

#### Scenario: Текущий runtime совместим с task-model projection
- **WHEN** runtime имеет `TaskData`, progress, prompt history и check-result
- **THEN** projection строит доменные сущности task/workflow/artifact
- **AND** runtime не мигрирует storage и не создаёт второй независимый file-set contract
