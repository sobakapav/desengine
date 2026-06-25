## MODIFIED Requirements

### Requirement: Стратегические changes владеют roadmap, а dispatcher потребляет их в орбите своего focus

Система SHALL хранить roadmap-документы в стратегических changes (`focus`, `idea`, `producer`) и запрещать локальные roadmap как источник истины для dispatcher.

#### Scenario: Dispatcher ссылается на унаследованный roadmap
- **WHEN** metadata dispatcher содержит `roadmap_ref`
- **THEN** значение имеет вид `<strategic-change>/roadmaps/<file>.md`
- **AND** `<strategic-change>` принадлежит той же focus-орбите, что и dispatcher
- **AND** файл roadmap существует у указанного владельца

#### Scenario: Dispatcher использует несколько roadmap
- **WHEN** одному dispatcher нужны несколько стратегических контекстов
- **THEN** metadata change использует `roadmap_refs` как список ссылок вида `<strategic-change>/roadmaps/<file>.md`
- **AND** каждая ссылка проходит ту же проверку focus-орбиты и существования файла

### Requirement: Producer ведёт собственный roadmap и работает как полный owner линии

Система SHALL трактовать `producer` как полного owner change-линии: он ведёт собственный roadmap, формирует и уточняет смысл линии, активно управляет downstream delivery и работает источником истины для подчинённых changes.

#### Scenario: Producer работает рядом с dispatcher без иерархического подчинения
- **WHEN** в одной focus-линии одновременно существуют producer и dispatcher
- **THEN** producer остаётся owner смысла, roadmap и управленческого контура линии
- **AND** dispatcher остаётся отдельным tactical child этого же `focus`
- **AND** расхождение producer и dispatcher по тактике трактуется как допустимый управленческий сигнал, а не как ошибка topology

### Requirement: Producer-контекст задаётся без дробления ownership

Система SHALL поддерживать producer ownership двумя способами: прямым `parent_change` на `producer` или отдельной меткой `producer_ref` у `implement` и `fix`, когда исполнительский change тактически подчинён dispatcher, но входит в producer-контекст.

#### Scenario: Dispatcher подчиняется focus напрямую
- **WHEN** metadata dispatcher содержит `parent_change`
- **THEN** `parent_change` указывает на change с `change_kind=focus`
- **AND** producer этой же линии, если он существует, выражается отдельным strategic roadmap-контекстом, а не иерархическим parent

#### Scenario: Dispatcher не может хранить producer-контекст
- **WHEN** metadata dispatcher содержит `producer_ref`
- **THEN** статическая проверка OpenSpec metadata завершается ошибкой
- **AND** producer-контекст для dispatcher должен выражаться через roadmap и общую focus-орбиту, а не через отдельную metadata-метку
