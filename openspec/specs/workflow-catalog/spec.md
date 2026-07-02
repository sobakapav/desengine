## Requirements

### Requirement: Система публикует каталог workflow-операций

Система SHALL иметь явный каталог workflow definitions как пользовательски и архитектурно значимую сущность.

#### Scenario: Пользователь или система видит каталог workflow
- **WHEN** проект показывает доступные способы работы
- **THEN** он может ссылаться на workflow catalog
- **AND** catalog содержит reusable definitions для компонентов, экранов, данных, Storybook, миграции и системного рефакторинга

#### Scenario: Workflow catalog группирует definitions по operation family
- **WHEN** система показывает список доступных workflow
- **THEN** definitions можно группировать по семействам операций вроде `create`, `compose`, `extract`, `migrate`, `document` и `refactor`
- **AND** такая группировка понятна пользователю и пригодна для product navigation

### Requirement: Workflow catalog не жёстко привязан к одному vertical slice

Система SHALL проектировать workflow catalog как слой, который переживает добавление новых subject scopes и operation families.

#### Scenario: Добавляется новый workflow family
- **WHEN** продукту нужен новый workflow вроде работы с доменной моделью или Storybook integration
- **THEN** он добавляется как новый definition в catalog
- **AND** системе не требуется переизобретать саму архитектуру workflow
