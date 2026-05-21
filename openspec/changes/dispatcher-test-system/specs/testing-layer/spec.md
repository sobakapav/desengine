## MODIFIED Requirements

### Requirement: Развитие тестового слоя не блокирует runtime

Система SHALL позволять развивать тестовый слой поэтапно без изменения пользовательского runtime и install-critical инфраструктуры, а управление такими изменениями вести через отдельный dispatcher тестовой подсистемы.

#### Scenario: Добавляется новый behavior-change

- **WHEN** команда создаёт или реализует новый OpenSpec change
- **THEN** change содержит тестовую часть: уровень проверки, команду запуска, mock/live требования и связь с общим тестовым слоем
- **AND** если покрытие откладывается, это фиксируется в coverage-plan с причиной

#### Scenario: Тестовый runtime или tooling меняется в общей подсистеме

- **WHEN** команде нужно изменить общий test harness, test-команды, traceability-правила или общий слой fixture/mock/live-практик
- **THEN** такие изменения оформляются как downstream `implement` или `fix` change под `dispatcher-test-system`
- **AND** сам `dispatcher-test-system` удерживает контракт, roadmap и контроль исполнения, но не подменяет исполнительский code-change

#### Scenario: Dispatcher создаёт child change для изменения тестовой подсистемы

- **WHEN** `dispatcher-test-system` порождает новый downstream change для runtime или tooling тестового слоя
- **THEN** child change наследует тестовый контекст через dispatcher
- **AND** dispatcher требует у child change человеко-понятную тестовую часть и явную команду проверки
