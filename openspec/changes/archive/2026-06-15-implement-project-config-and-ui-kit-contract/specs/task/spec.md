## ADDED Requirements

### Requirement: Prompt context использует project-level UI kit contract

Система SHALL строить prompt/render context с учётом выбранного и effective UI kit проекта, чтобы prompt templates и preview опирались на один project source of truth.

#### Scenario: Пользователь меняет UI kit проекта и prompt context это отражает
- **WHEN** для проекта выбран `uiKitId`
- **THEN** task prompt/render context использует этот project-level contract
- **AND** пользователю можно объяснить связь между project settings, prompt templates и preview runtime

#### Scenario: Prompt context использует selected и effective UI kit из одного project contract
- **WHEN** проект меняет `uiKitId` или `uiMode`
- **THEN** prompt/render context сохраняет selected UI kit проекта
- **AND** effective UI kit продолжает вычисляться из того же project source of truth
