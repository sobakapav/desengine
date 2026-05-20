## MODIFIED Requirements

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
- **WHEN** пользователь меняет `project.uiKitId` в лаборатории
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
