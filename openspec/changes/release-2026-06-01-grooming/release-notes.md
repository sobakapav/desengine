# Release Notes: release-2026-06-01-grooming

## Состав волны

- `implement-integration-test-runner-foundation`
- `implement-route-integration-fixture-wave`
- `fix-browser-verification-runtime`
- `fix-deepseek-doc-contract`

## Назначение

Release фиксирует текущую grooming-волну integration-слоя как активный delivery-срез и заменяет historical release `release-2026-05-25-night` в metadata active changes.

## Изменения в релизе

### Последний коммит

- Улучшено оформление текущей релизной волны и собраны актуальные release notes в одном месте.
- В отдельный test-system fix вынесена стабилизация browser verification, чтобы отделить сбои Playwright/server startup от реальных продуктовых регрессий.
- В отдельный documentation-fix вынесено согласование DeepSeek docs с новым fail-fast contract для запросов с картинками.
- Исправлено двойное списание лимита за один пользовательский запрос.
- Повышена стабильность onboarding-синхронизации для проектов на другом диске.
- Исправлено отображение preview-задач с произвольными Tailwind-значениями и корректной шириной компонентов.
- Обновлены smoke-проверки под актуальный локальный конфиг.
- Убрано ложное предупреждение о нерелизной версии при работе из релизного тега с локальными изменениями.
- Согласован контракт style-файлов level 3, чтобы избежать расхождений в именах и проверках.
