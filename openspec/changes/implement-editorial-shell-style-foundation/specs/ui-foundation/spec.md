## MODIFIED Requirements

### Requirement: Product-shell интерфейс использует единый монохромный visual contract

Система SHALL рендерить product-shell интерфейс в едином монохромном visual language вместо смешения локальных page-level паттернов.

Под этим контрактом понимаются светлый paper-like фон, тонкие тёмные границы, крупная serif-типографика для display-ролей, uppercase eyebrow labels, прямые линии без скруглений, пунктирные secondary callout-блоки и inversion-based active-state для выбора и primary action.

#### Scenario: Команда добавляет новый product-shell экран
- **WHEN** экран относится к `app/**` или к shell-компонентам `components/desengine/**`
- **THEN** он использует общий editorial contract для page frame, section surface, title hierarchy и actions
- **AND** не собирает эти роли заново случайным набором локальных визуальных решений

#### Scenario: Команда выравнивает существующие project/workflow surfaces
- **WHEN** несколько product-shell экранов показывают project, workflow или workbench путь
- **THEN** они должны читаться как части одного визуального маршрута
- **AND** использовать согласованные рамки, отступы, типографические роли и active-state

### Requirement: Visual roles product-shell задаются как общие shell primitives

Система SHALL задавать повторяющиеся visual roles product-shell как общие shell primitives, а не как изолированные page-level заплатки.

#### Scenario: Повторяется паттерн секции или карточки
- **WHEN** один и тот же section/card/callout/button treatment используется более чем на одной surface
- **THEN** он оформляется как общий shell primitive
- **AND** дальнейшие product-shell экраны используют именно его

#### Scenario: Команда пытается локально переопределить active-state
- **WHEN** в navigation, tabs или button-group появляется новый активный элемент
- **THEN** active-state должен опираться на единый inversion-based contract
- **AND** не должен заменяться случайным page-level accent treatment

### Requirement: Editorial shell не навязывается пользовательской рабочей области

Система SHALL ограничивать editorial shell contract продуктовой оболочкой и не переносить его как обязательный стиль в пользовательский preview, iframe runtime и генерируемые рабочие файлы.

#### Scenario: Открыта рабочая область с пользовательским preview
- **WHEN** product-shell рендерит workbench и preview рядом
- **THEN** editorial contract применяется к shell-рамке, навигации, метаданным и действиям
- **AND** не внедряется как обязательный стиль внутрь пользовательского preview

#### Scenario: Команда меняет пользовательский компонент или учебный контент
- **WHEN** изменение касается генерируемых рабочих файлов или контента, который не является частью product-shell оболочки
- **THEN** требования editorial shell contract не навязывают этим файлам миграцию на общий shell style
