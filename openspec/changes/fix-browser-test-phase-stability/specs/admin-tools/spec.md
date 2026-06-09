## MODIFIED Requirements

### Requirement: Исполнительский change закрывается через каскад

#### Scenario: Browser-oriented close-path требует валидных browser phases

- **WHEN** запускается `npm run os:close -- <implement-or-fix-change>` для change с `verification_level=component/browser`
- **THEN** инструмент принимает browser verdict только после успешного прохождения обязательных фаз `target-ready`, `browser-ready` и `fixture-ready`
- **AND** phase-level failure явно маркируется как системный blocker browser verification
- **AND** change не архивируется по результату невалидной browser-фазы
