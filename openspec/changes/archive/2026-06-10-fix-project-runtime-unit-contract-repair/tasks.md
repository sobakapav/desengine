## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Синхронизировать unit-моки и ожидания под project-aware runtime контракты
- [x] 3. Обновить handoff, metadata и release-note артефакт change под внешний repair-срез
- [ ] 4. Выполнить внешнюю проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `task`: `Пользователь открывает task screen внутри активного проекта`.
- `task`: `Task runtime сохраняет active project при действиях пользователя`.
- `iteration`: `Модель не изменила ни один рабочий файл`.
- `iteration`: `Все изменения отфильтрованы allowlist уровня`.
- `task-levels`: `Пользователь впервые входит в новый уровень задачи`.
- `testing-layer`: `Unit-проверка читает project-aware task client boundary`.

Уровни проверки:
- unit: обязательный внешний verification layer, потому что регрессия проявляется в unit-контрактах project-aware runtime и helper tests.
- static/contract: дополнительный sanity-слой для просмотра readiness OpenSpec-артефактов change.
- component/browser: не требуется для этого repair-среза.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команда запуска:
- `npm run test:unit -- test/unit/task-iterate-noop-feedback.test.ts test/unit/task-project-client-boundary.test.ts test/unit/task-screen-data.test.ts test/unit/task-server-runtime-mutations.test.ts`

Mock/fixture-данные и credentials:
- Используются локальные unit-моки `@/lib/user/server`, `@/lib/onboarding/repository`, `@/lib/task/server-runtime-storage` и fixture-данные task/progress/project прямо в тестах.
- Live credentials не требуются.

Отложенное покрытие:
- Не требуется: этот fix не добавляет новый runtime branch, а восстанавливает совместимость существующих unit-сценариев.
