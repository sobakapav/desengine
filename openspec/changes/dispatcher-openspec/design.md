## Техническая проработка

Технические детали реализации ведутся в GitHub issue:
- https://github.com/sobakapav/desengine/issues/7

OpenSpec в этом change фиксирует продуктовый контракт и критерии согласованности слоёв.

## Что такое OpenSpec-слой проекта

OpenSpec-слой в этом репозитории состоит из трёх взаимосвязанных контуров:

1. Продуктовый контракт
   - `openspec/specs/**`
   - `proposal/design/tasks` changes
2. Workflow changes
   - роли `focus/release/idea/producer/dispatcher/implement/fix`
   - preflight, handoff, release-матрица, закрытие change
3. Инструментарий OpenSpec
   - `openspec:new`, `os:*`, traceability и связанные проверки

Кастомная схема metadata — только один из подслоёв workflow и tooling-контура.

## Принципы OpenSpec-слоя

- OpenSpec развивается не как “набор полей metadata”, а как управленческий слой проекта.
- Инструменты должны поддерживать не только валидность полей, но и валидность передачи работы между changes.
- Слой должен быть product-oriented: поддерживать стратегию, тактику, delivery и исполнительский handoff.
- Инварианты workflow не остаются устными договорённостями, а поднимаются в tools, specs и проверки.

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

- `change_kind`: `focus | release | idea | producer | dispatcher | implement | fix`
- `status`: draft/active/paused/done/archived
- `depends_on_change[]` (массив, не строка) — с обратной совместимостью к текущему единичному полю
- `test_plan` (ссылка/указание команд/уровней)
- `issue`: URL/номер главного GitHub issue для change
- `review_sync_state`: none/needs-sync/needs-review/in-sync
- `parent_change`: id предка для `dispatcher`, `implement` и `fix`
- `strategy_root`: id корневого стратегического change
- `roadmap_ref`: одиночная ссылка на унаследованный roadmap стратегического владельца
- `roadmap_refs`: список унаследованных roadmap, если одному dispatcher нужны несколько стратегических контекстов
- `release_ref`: ссылка на release change как метка принадлежности релизу
- `producer_ref`: ссылка на producer change как контекст ожиданий delivery для `implement/fix`, не заменяющий `parent_change`
- `verification_level`: целевой уровень проверки для внедренческого change
- `verification_command`: команда запуска проверки для внедренческого change
- `execution_mode`: `no-code | code`

## Правила классификации change

- `focus`: непрерывный стратегический фокус внимания; `execution_mode=no-code`; `parent_change` пустой.
- `release`: стратегическая метка релиза; `execution_mode=no-code`; не имеет родителя и не может быть родителем.
- `idea`: гипотеза/мысль; `execution_mode=no-code`; может быть верхнеуровневой или дочерней к `focus`.
- `producer`: стратегический продюсерский слой; `execution_mode=no-code`; может быть верхнеуровневым и может ссылаться только на стратегического родителя (`focus|idea|producer`).
- `producer` ведёт собственный roadmap, формирует ожидания к downstream delivery и работает через переговоры с dispatcher changes, а не через direct implement/fix children.
- `dispatcher`: тактический слой; `execution_mode=no-code`; обязательны `parent_change` и `roadmap_ref` или `roadmap_refs`; управляет `implement` changes.
- `dispatcher` не может иметь `producer_ref`: тактическая линия должна оставаться независимой от producer на уровне metadata.
- `dispatcher` обязан быть child соответствующего `focus`; верхнеуровневый dispatcher и `dispatcher -> producer` считаются ошибкой topology.
- roadmap для dispatcher не хранится в его собственном каталоге как источник истины: он должен ссылаться на roadmap стратегического владельца (`focus|idea|producer`) по пути `<change>/roadmaps/<file>.md`.
- если у dispatcher тактический родитель типа `dispatcher`, roadmap допускается наследовать от стратегического предка по цепочке `parent_change` и/или от `strategy_root`.
- `implement`: внедренческий слой; `execution_mode=code`; обязательный `parent_change` на `dispatcher`, а также `strategy_root`, `verification_level`, `verification_command`.
- `fix`: быстрый внедренческий слой для небольших исправлений; `execution_mode=code`; обязательный `parent_change` на `dispatcher`, а также `strategy_root`, `verification_level`, `verification_command`.
- `implement/fix` могут иметь собственный `producer_ref`, если исполнительская задача входит в producer-контекст. Это позволяет видеть producer-контекст без перевода producer в иерархического владельца.
- Прямое изменение кода допускается только в `implement` и `fix`.
- `focus`, `idea`, `producer`, `dispatcher` и `release` обязаны заниматься только решениями своего уровня, порождать downstream changes и принимать их результат, не подменяя исполнительский слой.

## Delivery-матрица release ↔ dispatcher

- `parent_change` задаёт тактическую вертикаль (`dispatcher -> implement/fix`) и ответственность за стратегию.
- `release_ref` задаёт релизную горизонталь и состав поставки.
- `producer_ref` задаёт контекст ожиданий producer только на исполнительском уровне и может пересекаться с тактической линией dispatcher без подмены родительства.
- Один implement/fix одновременно принадлежит:
  - тактическому dispatcher (через `parent_change`);
  - конкретному release (через `release_ref`).
- При необходимости этот же implement/fix дополнительно входит в producer-контекст через `producer_ref`.
- Release не становится иерархическим родителем: это оркестратор поставки, а не владелец стратегии.

## Правила синхронизации OpenSpec ↔ Issues

- Для product-only change `issue` может быть пустым.
- После явной отмашки на техническую проработку у change должен быть указан `issue`.
- В описании главного issue должна быть явная ссылка на идентификатор change.
- Создание sub-issue для task — не обязательное по умолчанию; создаётся для задач, которые занимают больше половины рабочего дня, имеют внешнюю зависимость или межкомандную координацию.
- Изменение change переводит `review_sync_state` в `needs-sync`.
- Существенное изменение технической постановки в issue переводит `review_sync_state` в `needs-review`.

## Инструменты

Что нужно адаптировать:

- генератор change (`tools/create-openspec-change.mjs`): шаблоны метаданных, handoff и базовых checks;
- list/overview (`tools/list-active-openspec-changes.mjs`, `tools/list-openspec-releases.mjs`);
- workflow-команды (`os:begin`, `os:dispatch`, `os:req`, `os:ctx`, `os:close`, `os:rename`);
- проверки: валидация схемы, traceability и статическая проверка согласованности.
  - `npm run test:traceability` валидирует `short` у активных changes по правилам кастомной схемы.
  - `npm run test:traceability` валидирует `change_kind`, `execution_mode`, связи (`parent_change`, `strategy_root`, `roadmap_ref`, `roadmap_refs`), ссылки `release_ref` и `producer_ref`, а также implement-поля проверки.
  - `npm run os:begin -- <change>` выполняет preflight: любой неисполнительский change получает явный запрет на прямое изменение кода и обязан перейти к downstream changes своего уровня.
  - `npm run os:begin -- <dispatcher-change>` отдельно напоминает, что dispatcher должен породить implement/fix change, передать ему inherited roadmap и потом принять результат.
  - `npm run os:begin -- <implement-or-fix-change>` отдельно напоминает, что код меняется только здесь, а стратегия и тактика уже заданы предками.
  - `npm run os:dispatch -- <dispatcher> --kind <implement|fix> --name <name>` создаёт и привязывает исполнительский change как основной путь обработки новых хотелок в dispatcher-контексте.
  - `npm run os:dispatch -- <release> --dispatcher <dispatcher> --kind <implement|fix> --name <name>` создаёт исполнительский change в delivery-матрице release↔dispatcher.
  - `npm run os:ctx -- <implement-or-fix-change>` выводит контекст parent dispatcher для release-чата, включая inherited roadmap стратегических владельцев.
  - `npm run os:close -- <implement-or-fix-change>` закрывает исполнительский change через проверочный каскад и архивирование.
  - `handoff.md` фиксирует обязательный контекст передачи для child changes и блокирует старт исполнения до содержательного заполнения.

## Миграция

- новый инструментарий должен понимать старые changes без обязательных новых полей;
- миграция старых changes — по мере необходимости (опционально, но план обязателен);
- поля `issue` и `review_sync_state` вводятся постепенно: сначала для новых changes, затем для активных текущих;
- дефолт для новых changes: `review_sync_state: none`, `issue: ""` до явного старта технической проработки.
- сам dispatcher теперь шире кастомной схемы: child changes могут работать как над metadata-схемой, так и над workflow OpenSpec в целом.
- legacy `roadmap_ref: "roadmaps/<file>.md"` у dispatcher мигрируется в ссылки на стратегического владельца; для нескольких roadmap вводится `roadmap_refs`.
- legacy-роль `research` мигрируется в `producer` вместе с именами changes, metadata и roadmap-владением.

## Закрытие change (MVP-каскад)

- Все связанные issues по change закрыты или явно перенесены в следующий change.
- В tasks и тестовой части change заполнены уровень проверки, команды запуска и данные для запуска (fixtures/credentials) или зафиксирована причина переноса.
- В change добавлены ссылки на PR/коммиты, подтверждающие реализацию.
- Зафиксирован краткий итог `planned vs built` (минимум 3 пункта расхождений/совпадений).

## Тестирование

- Unit: парсинг/валидация метаданных.
- Unit: workflow-инварианты (`handoff`, `rename`, preflight-gates, release-матрица), если change затрагивает соответствующие команды.
- Traceability: изменения в инструменте не ломают проверку `npm run test:traceability`.
