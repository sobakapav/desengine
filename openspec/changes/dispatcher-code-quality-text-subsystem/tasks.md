## 1. Каркас отдельной подсистемы

- [x] 1.1 Создать каталог `tools/quality-text/` с подпапками `rules`, `reporters` и базовыми index-модулями.
- [x] 1.2 Перенести текущую логику из `tools/testing/check-code-readability.mjs` в `tools/quality-text/engine.mjs`.
- [ ] 1.3 Вынести правила в отдельные файлы `tools/quality-text/rules/*.mjs` (file-length, function-length, todo-format, boolean-trap, floating-promise, api-example).
- [x] 1.4 Вынести конфиг лимитов и режимов в `tools/quality-text/config.json`.
- [x] 1.5 Перенести waiver-реестр в `tools/quality-text/waivers.json` и оставить совместимый bridge из старого пути на период migration.

## 2. Команды и совместимость

- [x] 2.1 Добавить канонические команды: `quality:text`, `quality:text:branch`, `quality:text:repo`.
- [x] 2.2 Перевести `test:readability*` в алиасы на канонические команды без изменения результата.
- [x] 2.3 Обновить `test:full`, чтобы он вызывал выделенный quality-gate подсистемы.
- [x] 2.4 Добавить unit-тесты на соответствие package scripts и алиасов.

## 3. Cost-guardrails для LLM-разработки

- [x] 3.1 Зафиксировать в engine запрет LLM и сетевых вызовов в обязательном режиме quality-gate.
- [ ] 3.2 Добавить optional LLM-режим только как выключенную по умолчанию feature-опцию (без включения в `test:full`).
- [ ] 3.3 В optional режиме добавить budget caps: максимум файлов, максимум токенов, fail-open в deterministic fallback.
- [ ] 3.4 Добавить метрики в отчёт подсистемы: `scope`, `filesChecked`, `violations`, `waivedViolations`, `llmMode`.

## 4. Документация для админов и разработчиков

- [x] 4.1 Обновить `README.md` (админский обзор quality-команд и их роль в обязательном контуре).
- [x] 4.2 Обновить `tools/README.md` (канонические команды подсистемы, waiver-политика, migration note с legacy aliases).
- [x] 4.3 Обновить `test/README.md` и `docs/testing-layer.md` (раздел про `code-quality-text`, режимы запуска, SLA по waivers).
- [x] 4.4 Добавить короткий README подсистемы `tools/quality-text/README.md` с правилами для разработчиков и администраторов.

## 5. Перенос текущего состояния и стабилизация

- [x] 5.1 Перенести существующие legacy-waivers в новый реестр без потери полей `owner/reason/targetStage`.
- [x] 5.2 Убедиться, что changed-scope режим остаётся дефолтом и не анализирует весь репозиторий без явной команды.
- [x] 5.3 Провести smoke migration: старые команды и новые команды дают эквивалентный результат на одном наборе изменений.
- [ ] 5.4 Подготовить release-note для команды о переходе на `quality:text*` и timeline удаления legacy aliases.

## 6. Проверка результата change

- [x] 6.1 Прогнать `npm run test:unit`.
- [x] 6.2 Прогнать `npm run test:traceability`.
- [x] 6.3 Прогнать `npm run test:full`.
- [ ] 6.4 Дополнительно прогнать `npm run quality:text:repo` перед закрытием migration-фазы.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `code-quality-text`:
  - `Разработчик запускает quality-проверку по рабочим изменениям`
  - `Существующий pipeline вызывает legacy-команду`
  - `Для legacy-файла вводится временное исключение`
  - `Разработчик запускает обязательный quality-gate`
  - `Large PR не вызывает катастрофический рост стоимости`
- `testing-layer`:
  - `Разработчик запускает полный локальный тестовый слой`

Уровни проверки:
- static/contract: обязательный
- unit: обязательный
- component/browser: не требуется
- integration: не требуется
- e2e smoke: не требуется
- live/provider: не требуется

Команды запуска:
- `npm run test:unit`
- `npm run test:traceability`
- `npm run test:full`
- `npm run quality:text:repo`

Mock/fixture-данные и credentials:
- Используются только локальные исходники и локальные waiver-файлы.
- Live credentials не требуются.
- LLM-режим не используется в обязательных проверках.

Если покрытие откладывается:
- Добавить запись в `test/traceability/coverage-plan.json` (для OpenSpec scenario coverage) и/или в `tools/quality-text/waivers.json` (для legacy code violations) с причиной и `targetStage`.
