## MODIFIED Requirements

### Requirement: Исполнительский change закрывается через каскад

#### Scenario: Browser-fix в Codex seatbelt закрывается через канонический wrapper-path

- **WHEN** запускается `npm run os:close -- <implement-or-fix-change>` для browser-oriented fix, чей verification command указывает прямой `npm run test:e2e -- test/e2e/*.spec.ts`
- **THEN** система переводит такой verification на канонический wrapper `node tools/testing/run-browser-verification-runtime.mjs ...`
- **AND** не считает direct sandboxed Playwright run валидным browser verdict для Codex seatbelt

#### Scenario: Browser-fix не закрывается без валидного preflight

- **WHEN** запускается `npm run os:close -- <implement-or-fix-change>` для `fix`, которому нужен browser verification preflight
- **THEN** система сначала выполняет browser verification preflight
- **AND** при невалидном preflight не запускает product-specific browser verdict
- **AND** не архивирует change
