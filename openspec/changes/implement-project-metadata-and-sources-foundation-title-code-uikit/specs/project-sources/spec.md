## ADDED Requirements

### Requirement: Проект хранит canonical metadata и sources

Система SHALL хранить у проекта отдельный canonical contract для metadata и sources, а не собирать эти данные из несвязанных полей и внешних документов.

#### Scenario: Пользователь задаёт базовые metadata проекта
- **WHEN** пользователь создаёт или редактирует проект
- **THEN** система хранит как минимум `title`, `code` и `uiKitId`
- **AND** `code` читается как отдельное project field, а не как случайный синоним технического `id`

#### Scenario: Project-owned sources читаются как часть project contract
- **WHEN** система читает структуру проекта
- **THEN** она отдельно видит `figmaFiles`, `componentGraph`, `screenGraph` и document archive
- **AND** эти данные принадлежат проекту целиком, а не одному workflow-run

### Requirement: Проект хранит Figma files как source registry

Система SHALL позволять проекту хранить project-level список Figma-файлов как canonical design sources.

#### Scenario: Пользователь привязывает Figma-файл к проекту
- **WHEN** пользователь добавляет Figma source в проект
- **THEN** система сохраняет file key или canonical URL, title и project связь
- **AND** не требует в той же волне полного import/sync engine

#### Scenario: Проект читает список Figma sources
- **WHEN** project surface или manifest читает metadata проекта
- **THEN** система показывает список привязанных Figma files
- **AND** этот список не смешивается с runtime artifacts

### Requirement: Проект хранит canonical component graph

Система SHALL хранить для проекта явный `componentGraph` как структурную карту компонентного состава.

#### Scenario: Пользователь читает состав проекта как граф
- **WHEN** система читает structural layer проекта
- **THEN** она видит nodes и edges component graph
- **AND** graph достаточен для чтения человеком и машиной без внешних догадок

### Requirement: Screen graph является подвидом component graph

Система SHALL трактовать `screenGraph` как особый structural slice проекта, а не как полностью отдельную несвязанную модель.

#### Scenario: Пользователь хранит структуру экранов
- **WHEN** в проекте появляются экраны и screen-level связи
- **THEN** система сохраняет их в `screenGraph`
- **AND** graph использует совместимую node/edge модель с component graph
- **AND** может ссылаться на компоненты как на части screen composition

### Requirement: Проект хранит document archive как file set

Система SHALL хранить аналитику, ТЗ и похожие документы проекта как простой project-owned набор файлов.

#### Scenario: Пользователь добавляет файл аналитики или ТЗ
- **WHEN** пользователь прикладывает документ к проекту
- **THEN** система сохраняет его в project archive как читаемый файл
- **AND** не требует БД или сложной knowledge schema в первой волне

#### Scenario: Архив допускает новые группы документов
- **WHEN** у проекта появляются новые document classes
- **THEN** archive contract позволяет добавить новые file groups
- **AND** не требует пересборки всей project model ради одного нового типа документа
