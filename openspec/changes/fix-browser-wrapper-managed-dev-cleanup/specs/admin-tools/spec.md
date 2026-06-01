## MODIFIED Requirements

### Requirement: Исполнительский change закрывается через каскад

#### Scenario: Browser-fix не блокируется остаточным managed next dev от предыдущего wrapper-run

- **WHEN** `npm run os:close -- <implement-or-fix-change>` запускает browser verification wrapper для preflight или product-specific verdict
- **THEN** wrapper не оставляет после себя managed `next dev`, который конфликтует со следующим шагом close-каскада
- **AND** `os:close` не должен трактовать такой остаточный процесс как product blocker закрываемого change
