## Tasks

- [x] 1. Собрать первый воспроизводимый Safari-specific срез и отделить его от внешнего шума.
- [x] 2. Локализовать и закрыть первый найденный runtime boundary: stale/unscoped preview runtime contract messages.
- [x] 3. Добавить verification-слой для этого boundary: unit + browser-spec на ложные/stale preview messages.
- [x] 4. Обновить handoff итоговой конкретикой по закрытому preview-session slice.
- [x] 5. Подтвердить или опровергнуть оставшийся широкий Safari path: dev-старт, авторизация, shell navigation, список задач, вход в задачу.
- [x] 6. Добыть валидный внешний `component/browser` verdict в execution mode, где browser preflight не искажается sandbox transport-ограничением.
- [x] 7. Если после стабилизации окружения подтвердится второй root cause, закрыть его отдельным runtime-срезом в рамках этого же change.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `level-labs`: `Пользователь открывает рабочую задачу лаборатории`
- `task`: `Preview поднимает runtime-ошибку Sandpack в host UI`
- `task`: `Preview игнорирует stale runtime contract messages`

Уровни проверки:
- component/browser: обязательный
- integration: по необходимости для локализации network/runtime boundary
- unit: допустим как вспомогательный слой, но не заменяет браузерную проверку
- e2e smoke: не требуется отдельно
- live/provider: не требуется

Команды запуска:
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/safari-task-runtime-instability.spec.ts`

Mock/fixture-данные и credentials:
- Browser verification использует fixture task flow без live provider credentials.
- Для browser/spec path нужен `DESENGINE_E2E_FIXTURE_ACCESS=1`.
- Для широкого Safari path уже подтверждено, что `/auth` в `next dev` может рендериться 9-15 секунд из-за синхронных resource probes на стороне application-code.
- Для текущего wrapper-path уже подтверждено, что sandboxed preflight может давать ложный transport verdict (`fetch failed` / connection failure) даже когда внешний unsandboxed probe получает `HTTP 200` от `/auth`.
- Перед внешней проверкой был очищен только повреждённый dev-cache `.next/dev`; install-critical инфраструктура не менялась.
