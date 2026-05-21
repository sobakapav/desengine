## Tasks

- [ ] 1. Выделить общий safe-move путь для onboarding sync.
- [ ] 2. Заменить прямой `rename` на fallback-safe перенос для `EXDEV`.
- [ ] 3. Гарантировать, что sync-marker создаётся только после успешного переноса.
- [ ] 4. Добавить unit-проверки на cross-device сценарий.
- [ ] 5. Обновить OpenSpec/traceability-след.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `onboarding-repo`: первичная и повторная синхронизация onboarding должна быть устойчивой.
- `external-local-onboarding`: локальная установка не должна ломаться из-за размещения проекта на другом диске.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется на первом шаге.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit && npm run test:traceability`

Mock/fixture-данные и credentials:
- Нужны локальные fs/mock сценарии без live credentials.
