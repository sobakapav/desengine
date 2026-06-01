## MODIFIED Requirements

### Requirement: Исполнительский change закрывается через каскад

#### Scenario: Browser-fix не закрывается без валидного preflight

- **WHEN** запускается `npm run os:close -- <implement-or-fix-change>` для `fix` с `verification_level=component/browser`
- **THEN** система сначала выполняет browser verification preflight
- **AND** при невалидном preflight не запускает product-specific browser verdict
- **AND** не архивирует change
