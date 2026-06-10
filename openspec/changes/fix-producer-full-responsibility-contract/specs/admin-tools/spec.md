## MODIFIED Requirements

### Requirement: Producer ведёт собственный roadmap и работает как полный owner линии

Система SHALL трактовать `producer` как полного owner change-линии: он ведёт собственный roadmap, формирует и уточняет смысл линии, активно управляет downstream delivery и работает источником истины для подчинённых changes.

#### Scenario: Создаётся producer change
- **WHEN** metadata change содержит `change_kind=producer`
- **THEN** в каталоге change существует как минимум один файл `roadmaps/*.md`
- **AND** этот roadmap принадлежит самому producer-change, а не его потомку

#### Scenario: Producer напрямую управляет исполнительским change
- **WHEN** implement или fix использует `parent_change` на producer
- **THEN** система считает producer полным owner этой исполнительской линии
- **AND** не требует обязательного промежуточного dispatcher только ради разделения ответственности

#### Scenario: Producer создаёт вспомогательный dispatcher без потери ownership
- **WHEN** producer-change инициирует follow-up работу
- **THEN** он MAY создать downstream dispatcher как тактический helper change
- **AND** такой dispatcher не отменяет, что producer остаётся владельцем смысла, roadmap и управленческого контура линии

#### Scenario: Producer появляется раньше формализованных требований и сценариев
- **WHEN** создаётся producer-change для большой линии трансформации
- **THEN** система не требует, чтобы requirements и scenarios уже были формализованы на старте самого producer
- **AND** допускает, что они будут порождены как результат проработки producer roadmap

### Requirement: Producer-контекст задаётся без дробления ownership

Система SHALL поддерживать producer ownership двумя способами: прямым `parent_change` на `producer` или отдельной меткой `producer_ref` у `implement` и `fix`, когда исполнительский change тактически подчинён dispatcher, но входит в producer-контекст.

#### Scenario: Implement или fix помечается producer-контекстом
- **WHEN** metadata implement/fix содержит `producer_ref`
- **THEN** значение указывает на change с `change_kind=producer`
- **AND** этот producer-контекст не заменяет `parent_change`, если parent уже задан на dispatcher, а существует как отдельная метка рядом с `release_ref`

#### Scenario: Implement или fix напрямую подчиняется producer
- **WHEN** metadata implement/fix содержит `parent_change` на producer
- **THEN** статическая проверка считает это допустимым способом выразить полный producer ownership
- **AND** `producer_ref` может отсутствовать, если producer уже выражен через `parent_change`

#### Scenario: Dispatcher подчиняется producer напрямую
- **WHEN** metadata dispatcher содержит `parent_change` на producer
- **THEN** статическая проверка OpenSpec metadata считает такую связь допустимой
- **AND** producer остаётся owner линии, даже если часть тактики ведёт этот dispatcher

#### Scenario: Dispatcher не может хранить producer-контекст
- **WHEN** metadata dispatcher содержит `producer_ref`
- **THEN** статическая проверка OpenSpec metadata завершается ошибкой
- **AND** producer ownership для dispatcher должен выражаться через `parent_change`, а не через отдельную контекстную метку
