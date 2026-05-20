## Why

Нужен единый верхнеуровневый контекст для направления, где пользовательский опыт накапливается, структурируется и затем превращается в LLM-навыки и практики.

Сейчас related research-changes существуют разрозненно, что усложняет синхронизацию гипотез, терминов и приоритетов.

## What Changes

- Вводится родительская idea-change для ветки «пользовательский опыт → LLM-навыки».
- К этой idea привязываются research-changes:
  - `research-user-experience-generalization`
  - `research-user-action-logging`
  - `research-expertise-attractors`
  - `research-skill-map`
- Idea фиксирует продуктовый смысл ветки и границы, не задавая техническую реализацию.

## Non-goals

- Не реализуем код и инфраструктурные изменения.
- Не создаём dispatcher/implement автоматически.

## Capabilities

### Modified Capabilities
- `openspec-tooling`: иерархия change получает явный родительский idea-уровень для research-ветки.

## Acceptance Criteria

- Parent idea существует и отражается в `npm run os:tree`.
- У связанных research задан `parent_change` и `strategy_root` на эту idea.
- `npm run test:traceability` проходит.
