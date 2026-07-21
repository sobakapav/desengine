## MODIFIED Requirements

### Requirement: Artifacts являются явным пользовательским слоем проекта

Система SHALL показывать artifacts как project-owned материалы работы, а document archive как отдельный project-owned file set, не смешивая эти два слоя без необходимости.

#### Scenario: Пользователь читает archive и artifacts проекта
- **WHEN** пользователь открывает материалы проекта
- **THEN** система может различать runtime/workflow artifacts и document archive
- **AND** аналитика, ТЗ и похожие документы не обязаны притворяться runtime artifact ради хранения в проекте
