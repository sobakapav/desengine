## Tasks

- [x] 1. Собрать воспроизводимый сценарий broken preview + successful check.
- [x] 2. Локализовать drift между preview runtime и check pipeline.
- [x] 3. Исправить product contract так, чтобы противоречие исчезло или стало честно диагностируемым.
- [x] 4. Добавить browser-level guard на этот path.
- [x] 5. Обновить handoff итоговой конкретикой: repro, root cause, решение и ограничения.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `task`: `Preview поднимает runtime-ошибку Sandpack в host UI`

Уровни проверки:
- component/browser: обязательный
- integration: по необходимости, если drift сидит в route/service boundary
- unit: допустим как вспомогательный слой
- live/provider: не требуется

Команды запуска:
- `npm run test:unit -- test/unit/preview-runtime-contract-message.test.ts test/unit/preview-runtime-contract-state.test.ts`
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/preview-check-parity.spec.ts`

Mock/fixture-данные и credentials:
- Использовать mock/fixture task state и локальные component snippets.
- Live credentials не требуются.

Статус покрытия:
- Unit-слой подтверждает helper-контракт для `render-error -> check guard message`.
- Browser guard `test/e2e/preview-check-parity.spec.ts` подтверждает, что host-side `render-error` signal блокирует entrypoint `Проверить результат`, показывает явную диагностику и не отправляет запрос в `/check`.
- Внешний прогон browser guard выполнен через canonical wrapper: `1 passed`.
