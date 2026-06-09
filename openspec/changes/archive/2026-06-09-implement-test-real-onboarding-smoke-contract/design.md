## Context

После стабилизации `test:full` часть unit-проверок была переведена на временные фикстуры. Это правильно для детерминированного локального слоя, но уменьшает прямой сигнал о состоянии реального onboarding checkout. Исторический bugfix вокруг `default.njk` уже показал, что runtime, smoke и repair могут разъехаться по-настоящему, а не только в unit-логике.

`dispatcher-test-system` требует, чтобы тестовая подсистема явно разделяла deterministic fixture-путь и runnable проверки реальных интеграционных поверхностей. Значит, проверка реального onboarding должна жить отдельным smoke/integration-контрактом, а не маскироваться под unit.

## Goals

- Вернуть проверку совместимости с реальным onboarding checkout как отдельный runnable слой.
- Явно описать границу между unit-фикстурами и real-checkout smoke.
- Зафиксировать команду, env и ожидаемую диагностику для внешней проверки onboarding.

## Non-goals

- Не делать `test:full` сетезависимым.
- Не заставлять unit-тесты читать `process.cwd()/onboarding`.
- Не строить новый live/provider слой поверх onboarding smoke.

## Decisions

1. Реальный onboarding должен проверяться отдельной командой, а не через `test:full`.
   - Это сохраняет deterministic обязательный слой и оставляет real checkout в явном opt-in smoke/integration контуре.

2. Smoke должен использовать настоящий onboarding source contract.
   - Проверка обязана идти через существующие `repair`/`inspect`/`validate` поверхности, а не через synthetic-only path.

3. Unit и smoke должны дополнять, а не подменять друг друга.
   - Unit отвечает за логику и fallback'и.
   - Smoke отвечает за совместимость с реальным checkout и локальным preflight.

4. Тестовый слой должен явно документировать env-требования.
   - Для real onboarding smoke нужно честно описать `ONBOARDING_REPO_URL` и связанные локальные условия.

## Risks / Trade-offs

- Если сделать smoke слишком зависимым от сети, он станет шумным и потеряет доверие.
- Если оставить только unit, реальная несовместимость checkout снова останется невидимой.
- Если смешать smoke с `test:full`, разработчики начнут получать ложные падения в обычном локальном цикле.

## Open Questions

- Достаточно ли усилить существующий `npm run smoke`, или нужен отдельный focused entry point для real onboarding contract.
- Нужен ли отдельный integration/spec test на smoke helper поверх текущего CLI preflight, чтобы часть диагностики проверялась без реального клона.
