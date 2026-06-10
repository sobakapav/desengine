## MODIFIED Requirements

### Requirement: Workflow runtime работает внутри active project context

Система SHALL строить workflow runtime и workflow projection внутри active project context, а не как изолированный процесс вне проекта.

#### Scenario: Пользователь продолжает процесс решения внутри активного проекта
- **WHEN** runtime строит workflow projection для выбранного active project
- **THEN** текущий `WorkflowStepInstance` получает `projectId` как часть базового контекста
- **AND** workflow layer не откатывается к безымянному project-less состоянию

#### Scenario: Workflow не требует жёсткого соответствия один шаг = один верстак
- **WHEN** система связывает workflow шаг с дальнейшим рабочим контуром
- **THEN** workflow сохраняет project-scoped связность
- **AND** не фиксирует архитектурное требование, что каждый шаг обязан иметь ровно один отдельный верстак
