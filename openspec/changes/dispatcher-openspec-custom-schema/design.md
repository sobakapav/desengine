## Техническая проработка

Технические детали реализации ведутся в GitHub issue:
- https://github.com/sobakapav/desengine/issues/7

OpenSpec в этом change фиксирует продуктовый контракт и критерии согласованности слоёв.

## Принципы кастомной схемы

- Схема расширяется аккуратно и версионируемо.
- Инструменты должны быть backward-compatible: неизвестные поля не ломают поведение.
- Метаданные должны улучшать продуктовую управляемость: статус, связи, тестовый след, ответственность.
- OpenSpec хранит только продуктовые требования; технические детали реализации уходят в связанные GitHub issues.

## Трёхслойная модель истины

- Слой 1 (постоянный): OpenSpec (`openspec/specs/**` + change-артефакты) фиксирует ожидаемое продуктовое поведение.
- Слой 2 (временный): GitHub issues фиксируют техническую декомпозицию и тактические решения.
- Слой 3 (факт): код и тесты фиксируют реально созданное поведение.
- Конфликт между слоями не скрывается: он маркируется `review_sync_state` и идёт в отдельный цикл анализа.

## Где хранить схему

Нужно выбрать источник truth:

- декларация схемы в репозитории (yaml/json);
- правила в `openspec/config.yaml` (если это подходит);
- комбинация: декларация + проверки.

## Набор полей (черновик MVP)

Стабилизировать:

- `short` (уже есть).
  - включение строгих правил через `short_policy: strict-v1` в metadata change;
  - `short` начинается с маленькой буквы (`\p{Ll}` в Unicode);
  - длина `short` не превышает 75 символов;
  - `short` не заканчивается знаком препинания.

Добавить (как кандидаты):

- `change_kind`: `focus | release | idea | research | dispatcher | implement | fix`
- `status`: draft/active/paused/done/archived
- `depends_on_change[]` (массив, не строка) — с обратной совместимостью к текущему единичному полю
- `test_plan` (ссылка/указание команд/уровней)
- `issue`: URL/номер главного GitHub issue для change
- `review_sync_state`: none/needs-sync/needs-review/in-sync
- `parent_change`: id предка для `dispatcher`, `implement` и `fix`
- `strategy_root`: id корневого стратегического change
- `roadmap_ref`: ссылка на roadmap (обязательно для `dispatcher`)
- `release_ref`: ссылка на release change как метка принадлежности релизу
- `verification_level`: целевой уровень проверки для внедренческого change
- `verification_command`: команда запуска проверки для внедренческого change
- `execution_mode`: `no-code | code`

## Правила классификации change

- `focus`: непрерывный стратегический фокус внимания; `execution_mode=no-code`; `parent_change` пустой.
- `release`: стратегическая метка релиза; `execution_mode=no-code`; не имеет родителя и не может быть родителем.
- `idea`: гипотеза/мысль; `execution_mode=no-code`; может быть верхнеуровневой или дочерней к `focus`.
- `research`: стратегический слой; `execution_mode=no-code`; может быть верхнеуровневым и может ссылаться только на стратегического родителя (`focus|idea|research`).
- `dispatcher`: тактический слой; `execution_mode=no-code`; обязательны `parent_change` и `roadmap_ref`; управляет `implement` changes.
- `dispatcher` может иметь родителя любого типа; единственное ограничение — dispatcher не может быть верхнеуровневым.
- `implement`: внедренческий слой; `execution_mode=code`; обязательный `parent_change` на `dispatcher`, а также `strategy_root`, `verification_level`, `verification_command`.
- `fix`: быстрый внедренческий слой для небольших исправлений; `execution_mode=code`; обязательный `parent_change`.

## Правила синхронизации OpenSpec ↔ Issues

- Для product-only change `issue` может быть пустым.
- После явной отмашки на техническую проработку у change должен быть указан `issue`.
- В описании главного issue должна быть явная ссылка на идентификатор change.
- Создание sub-issue для task — не обязательное по умолчанию; создаётся для задач, которые занимают больше половины рабочего дня, имеют внешнюю зависимость или межкомандную координацию.
- Изменение change переводит `review_sync_state` в `needs-sync`.
- Существенное изменение технической постановки в issue переводит `review_sync_state` в `needs-review`.

## Инструменты

Что нужно адаптировать:

- генератор change (`tools/create-openspec-change.mjs`): шаблоны метаданных и валидации;
- листинг (`tools/list-active-openspec-changes.mjs`): вывод важных полей (kind/status/depends);
- проверки (если есть): валидация схемы и статическая проверка согласованности.
  - `npm run test:traceability` валидирует `short` у активных changes по правилам кастомной схемы.
  - `npm run test:traceability` валидирует `change_kind`, `execution_mode`, связи (`parent_change`, `strategy_root`, `roadmap_ref`), ссылку `release_ref` и implement-поля проверки.
  - `npm run os:begin -- <change>` выполняет preflight: dispatcher не может перейти в режим прямой реализации и должен породить implement/fix change.
  - `npm run os:dispatch -- <dispatcher> --kind <implement|fix> --name <name>` создаёт и привязывает исполнительский change как основной путь обработки новых хотелок в dispatcher-контексте.
  - `npm run os:close -- <implement-or-fix-change>` закрывает исполнительский change через проверочный каскад и архивирование.

## Миграция

- новый инструментарий должен понимать старые changes без обязательных новых полей;
- миграция старых changes — по мере необходимости (опционально, но план обязателен);
- поля `issue` и `review_sync_state` вводятся постепенно: сначала для новых changes, затем для активных текущих;
- дефолт для новых changes: `review_sync_state: none`, `issue: ""` до явного старта технической проработки.

## Закрытие change (MVP-каскад)

- Все связанные issues по change закрыты или явно перенесены в следующий change.
- В tasks и тестовой части change заполнены уровень проверки, команды запуска и данные для запуска (fixtures/credentials) или зафиксирована причина переноса.
- В change добавлены ссылки на PR/коммиты, подтверждающие реализацию.
- Зафиксирован краткий итог `planned vs built` (минимум 3 пункта расхождений/совпадений).

## Тестирование

- Unit: парсинг/валидация метаданных.
- Traceability: изменения в инструменте не ломают проверку `npm run test:traceability`.
