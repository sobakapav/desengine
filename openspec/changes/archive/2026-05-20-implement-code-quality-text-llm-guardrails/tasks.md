## Tasks

- [x] 1. Добавить конфиг optional LLM-режима с `mode: off` по умолчанию.
- [x] 2. Добавить budget caps: максимум файлов и максимум токенов.
- [x] 3. Реализовать deterministic fallback при выключенном режиме, превышении бюджета или ошибке optional режима.
- [x] 4. Добавить метрики отчёта: `scope`, `filesChecked`, `violations`, `waivedViolations`, `llmMode`.
- [x] 5. Обновить unit/static contract ожидания.
- [x] 6. Проверить `npm run test:unit`, `npm run quality:text`, `npm run test:full`.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text` / `Разработчик запускает обязательный quality-gate`, `Optional LLM-режим включается вручную`, `Large PR не вызывает катастрофический рост стоимости`; `testing-layer` / `Разработчик запускает полный локальный тестовый слой`.
- [x] Уровень проверки: static/contract + unit.
- [x] Команды запуска: `npm run test:unit`, `npm run quality:text`, `npm run test:full`.
- [x] Mock/fixture-данные: локальные исходники; live credentials не нужны.
- [x] Покрытие не откладывается: optional LLM зафиксирован как выключенный/guarded режим без provider-вызова.
