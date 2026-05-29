# Административные утилиты

## Purpose

Зафиксировать единый контракт документации административного контура, чтобы root-документы и `tools/README.md` не расходились в командах и назначении.
## Requirements
### Requirement: Документация админских утилит согласована с root-инструкциями

Система SHALL поддерживать `tools/README.md` в согласованном состоянии с `README.md`, `INSTALL.md` и профильными документами из `docs/**`, если они упоминают канонические административные команды.

#### Scenario: Root-документ упоминает административную команду
- **WHEN** `README.md`, `INSTALL.md` или документ в `docs/**` ссылается на служебную команду сопровождения
- **THEN** эта команда совпадает с канонической формой из `tools/README.md`
- **AND** не описывается как ad hoc shell-фрагмент вместо официального `npm run ...`

### Requirement: Документация админского контура явно маркирует свою аудиторию

Система SHALL в документации админских утилит явно обозначать, что такие шаги относятся к административному контуру, а не к browser-only пользовательскому сценарию.

#### Scenario: Читатель открывает `tools/README.md` или admin-раздел root-документации
- **WHEN** он читает инструкцию по служебной операции
- **THEN** документ явно показывает, что речь идёт об административном сценарии
- **AND** не подаёт эту операцию как обязательный шаг обычного пользователя

### Requirement: Unit-тесты хранятся в едином каталоге `test/unit`

Система SHALL хранить unit-тесты в каталоге `test/unit`, а не рядом с runtime-модулями `lib`.

#### Scenario: Разработчик запускает unit-проект Vitest
- **WHEN** разработчик выполняет `npx vitest run --project unit`
- **THEN** Vitest находит unit-тесты по шаблону `test/unit/**/*.test.ts`
- **AND** тестовые файлы не лежат в `lib/`

### Requirement: `lib` организован по доменным подпапкам

Система SHALL хранить внутренние runtime-модули в `lib` по доменным подпапкам вместо плоского списка файлов верхнего уровня.

#### Scenario: Разработчик добавляет новый модуль в `lib`
- **WHEN** разработчик добавляет или переносит модуль внутренней логики
- **THEN** файл размещается в соответствующей доменной подпапке (`access`, `task`, `llm`, `onboarding`, `config`, `editor`, `platform`)
- **AND** новые импорты используют новый фактический путь без legacy-реэкспортов

### Requirement: Список релизов OpenSpec показывает только актуальные changes

Система SHALL в команде `npm run os:r` показывать только активные release changes и только активный состав поставки по полю `release_ref`.

#### Scenario: Разработчик выводит список релизов
- **WHEN** разработчик запускает `npm run os:r`
- **THEN** в вывод попадают только changes из `openspec/changes/*`
- **AND** archived changes из `openspec/changes/archive/*` не печатаются ни как release, ни как элементы состава
- **AND** активный состав релиза печатается как delivery-матрица `parent dispatcher -> implement/fix`, если у элементов состава задан `parent_change`

### Requirement: Release оркестрирует delivery-матрицу, не подменяя dispatcher

Система SHALL позволять release change управлять составом поставки через связь `release_ref`, сохраняя тактическое подчинение исполнительских changes их parent dispatcher.

#### Scenario: Release-диспетчеризация новой хотелки
- **WHEN** разработчик запускает `npm run os:dispatch -- <release-change> --dispatcher <dispatcher-change> --kind <implement|fix> --name <name>`
- **THEN** создаётся исполнительский change с `parent_change=<dispatcher-change>`
- **AND** у него проставляется `release_ref=<release-change>`
- **AND** дальнейшая реализация выполняется только в этом implement/fix change

#### Scenario: Разработчик открывает implement/fix из release-контекста через `os:ctx`
- **WHEN** разработчик запускает `npm run os:ctx -- <implement-or-fix-change>`, у которого задан `release_ref`
- **THEN** команда показывает `release_ref`, parent dispatcher и его ключевые артефакты
- **AND** показывает inherited roadmap стратегических владельцев dispatcher
- **AND** явно напоминает, что parent dispatcher отвечает за тактику и приёмку результата

### Requirement: Команда `npm run os` показывает иерархию active changes

Система SHALL использовать `npm run os` как основной листинг active OpenSpec changes с иерархией родительства, role-эмодзи и краткими пояснениями.

#### Scenario: Разработчик запускает `npm run os`
- **WHEN** разработчик запускает `npm run os`
- **THEN** команда печатает дерево active changes
- **AND** каждая строка показывает role-эмодзи перед именем change
- **AND** archived changes не печатаются

#### Scenario: Названия root changes подсвечиваются ярко-белым
- **WHEN** listing-команда семейства `npm run os` печатает change первого уровня
- **THEN** имя этого change подсвечено ярко-белым ANSI-цветом
- **AND** вложенные changes не получают этот цвет только из-за глубины

#### Scenario: Разработчик запускает `npm run os:short`
- **WHEN** разработчик запускает `npm run os:short`
- **THEN** команда печатает тот же active tree-listing
- **AND** из вывода исключаются `implement` и `fix` changes
- **AND** остальные роли и иерархия сохраняются

#### Scenario: Разработчик фильтрует внимание через `npm run os -- <word>`
- **WHEN** разработчик запускает `npm run os -- dispatcher`
- **THEN** команда печатает тот же базовый tree-output
- **AND** совпадения слова `dispatcher` в выводе подсвечиваются красным ANSI-цветом

#### Scenario: Разработчик выводит исполнительские задачи по producer
- **WHEN** разработчик запускает `npm run os:p`
- **THEN** команда печатает только те active producer changes, у которых есть связанные `implement` или `fix` changes
- **AND** для каждого producer показывает связанные `implement` и `fix` changes

### Requirement: Child change получает отдельный handoff-артефакт для передачи исполнения

Система SHALL при создании change для последующего исполнения создавать `handoff.md` с обязательными секциями, чтобы создатель зафиксировал миссию, унаследованный контекст, источники, границы, проверку и открытые вопросы.

#### Scenario: Разработчик создаёт child change для другого исполнителя
- **WHEN** разработчик создаёт новый implement/fix change через `openspec:new`, `os:dispatch` или `os:begin --spawn-implement`
- **THEN** в каталоге change создаётся `handoff.md`
- **AND** файл уже содержит секции `Миссия`, `Унаследованный контекст`, `Обязательные источники`, `Границы исполнения`, `Проверка результата`, `Открытые вопросы`

### Requirement: Preflight не пускает implement/fix в исполнение без содержательного handoff

Система SHALL блокировать `npm run os:begin -- <implement-or-fix-change>`, если handoff-артефакт не заполнен по существу.

#### Scenario: Разработчик пытается начать implement/fix без заполненного handoff
- **WHEN** `handoff.md` отсутствует или содержит плейсхолдеры
- **THEN** `npm run os:begin -- <implement-or-fix-change>` завершается отказом
- **AND** сообщение явно указывает путь к `handoff.md`
- **AND** перечисляет причины, по которым handoff ещё не считается готовым

### Requirement: Переименование change проходит через валидируемую admin-команду

Система SHALL поддерживать `npm run os:rename -- <old-name> <new-name>` для переименования change с обновлением структурных metadata-ссылок на него.

#### Scenario: Разработчик переименовывает change через admin-команду
- **WHEN** разработчик запускает `npm run os:rename -- release-may-21 release-2026-05-21-day`
- **THEN** каталог change получает новое имя
- **AND** сам change обновляет собственные текстовые упоминания старого имени
- **AND** metadata-ссылки `parent_change`, `strategy_root`, `roadmap_ref`, `roadmap_refs`, `release_ref`, `producer_ref` в других changes указывают на новое имя

### Requirement: Стратегические changes владеют roadmap, а dispatcher только потребляет их

Система SHALL хранить roadmap-документы в стратегических changes (`focus`, `idea`, `producer`) и запрещать локальные roadmap как источник истины для dispatcher.

#### Scenario: Стратегический change публикует roadmap для потомков
- **WHEN** стратегический change задаёт управленческий контур для downstream dispatcher
- **THEN** roadmap хранится в его собственном каталоге `openspec/changes/<strategic-change>/roadmaps/*.md`
- **AND** этот roadmap поддерживается как часть стратегического контракта, а не как побочный файл потомка

#### Scenario: Dispatcher ссылается на унаследованный roadmap
- **WHEN** metadata dispatcher содержит `roadmap_ref`
- **THEN** значение имеет вид `<strategic-change>/roadmaps/<file>.md`
- **AND** `<strategic-change>` является стратегическим предком dispatcher или его `strategy_root`
- **AND** файл roadmap существует у указанного владельца

#### Scenario: Dispatcher использует несколько roadmap
- **WHEN** одному dispatcher нужны несколько стратегических контекстов
- **THEN** metadata change использует `roadmap_refs` как список ссылок вида `<strategic-change>/roadmaps/<file>.md`
- **AND** каждая ссылка проходит ту же проверку наследования и существования файла

### Requirement: Producer ведёт собственный roadmap и работает через dispatcher

Система SHALL трактовать `producer` как стратегический продюсерский change: он ведёт собственный roadmap, формирует ожидания к delivery и не получает direct implement/fix children.

#### Scenario: Создаётся producer change
- **WHEN** metadata change содержит `change_kind=producer`
- **THEN** в каталоге change существует как минимум один файл `roadmaps/*.md`
- **AND** этот roadmap принадлежит самому producer-change, а не его потомку

#### Scenario: Producer передаёт delivery downstream dispatcher
- **WHEN** producer-change инициирует follow-up работу
- **THEN** он согласует её через dispatcher changes
- **AND** implement/fix changes не используют producer как `parent_change`

### Requirement: Код меняют только implement/fix, остальные roles управляют потомками

Система SHALL трактовать `focus`, `idea`, `producer`, `dispatcher` и `release` как неисполнительские роли: они принимают решения своего уровня, порождают downstream changes и проверяют их результат, но не меняют код напрямую.

#### Scenario: Разработчик пытается начать неисполнительский change
- **WHEN** разработчик запускает `npm run os:begin -- <focus|idea|producer|dispatcher|release-change>`
- **THEN** команда явно сообщает, что прямое изменение кода запрещено
- **AND** объясняет, какими downstream changes должен управлять этот change
- **AND** подсказывает следующий допустимый шаг вместо прямой реализации

#### Scenario: Разработчик начинает implement/fix change
- **WHEN** разработчик запускает `npm run os:begin -- <implement-or-fix-change>`
- **THEN** команда явно сообщает, что код меняется только на уровне implement/fix
- **AND** напоминает, что стратегия и тактика уже заданы предками
- **AND** напоминает, что parent dispatcher отвечает за постановку и приёмку результата

### Requirement: Producer-контекст задаётся только на исполнительских changes

Система SHALL поддерживать поле `producer_ref` только для `implement` и `fix`, чтобы исполнительская ветка могла явно знать свой producer-контекст без превращения producer в иерархического родителя.

#### Scenario: Implement или fix помечается producer-контекстом
- **WHEN** metadata implement/fix содержит `producer_ref`
- **THEN** значение указывает на change с `change_kind=producer`
- **AND** этот producer-контекст не заменяет `parent_change`, а существует как отдельная метка рядом с `release_ref`

#### Scenario: Dispatcher не подчиняется producer напрямую
- **WHEN** metadata dispatcher содержит `parent_change` на producer
- **THEN** статическая проверка OpenSpec metadata завершается ошибкой
- **AND** producer-контекст не должен выражаться через `parent_change`

#### Scenario: Dispatcher не может хранить producer-контекст
- **WHEN** metadata dispatcher содержит `producer_ref`
- **THEN** статическая проверка OpenSpec metadata завершается ошибкой
- **AND** producer-контекст должен храниться только на implement/fix

### Requirement: Контекст исполнения показывает унаследованные roadmap dispatcher

Система SHALL в контекстных командах исполнения показывать roadmap стратегических владельцев, которыми руководствуется dispatcher.

#### Scenario: Разработчик открывает implement/fix через `os:ctx`
- **WHEN** разработчик запускает `npm run os:ctx -- <implement-or-fix-change>`
- **THEN** команда показывает `proposal/design/tasks` parent dispatcher
- **AND** дополнительно показывает все inherited roadmap, на которые ссылается dispatcher
- **AND** явно напоминает, что parent dispatcher отвечает за тактику и приёмку результата
- **AND** при наличии `producer_ref` показывает producer-артефакты и сам producer-контекст

### Requirement: Голый суффикс даты запрещён при создании, диспетчеризации и переименовании change

Система SHALL отклонять change-имя, которое заканчивается на `-YYYY-MM-DD`, во всех официальных командах изменения имени.

#### Scenario: Разработчик задаёт имя change с голым суффиксом даты
- **WHEN** разработчик пытается создать, диспетчеризовать или переименовать change в имя вида `release-2026-05-21`
- **THEN** команда завершается ошибкой
- **AND** сообщение явно объясняет, что нужен дополнительный смысловой суффикс, например `-day`
