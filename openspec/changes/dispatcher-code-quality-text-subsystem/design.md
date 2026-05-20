## Context

В репозитории уже есть рабочий readability-gate, но он исторически появился внутри общего тестового слоя и частично пересекается с другими инициативами. Для устойчивого развития нужен отдельный subsystem boundary: собственные правила, конфиг, режимы запуска, waiver-политика и документация.

Ключевое ограничение: новая подсистема не должна сделать LLM-разработку заметно дороже и медленнее. Поэтому обязательный контур должен быть deterministic и локальным.

## Goals / Non-Goals

**Goals:**

- Выделить `code-quality-text` как отдельную подсистему с независимым roadmap.
- Сохранить бесшовную интеграцию в `test:full` без ручных действий.
- Дать прозрачный migration-путь с `test:readability*` на `quality:text*`.
- Формализовать cost-guardrails для LLM-потока разработки.
- Зафиксировать инструкции для администраторов и разработчиков в README-документах.

**Non-Goals:**

- Полный одномоментный рефакторинг всех legacy-файлов под новые лимиты.
- Включение LLM в обязательный quality-gate.
- Замена install-critical стека (Node.js, Next.js, Turbopack, сборщик).

## Decisions

1. Отдельная структура подсистемы:
   - `tools/quality-text/engine.mjs` — оркестрация проверки;
   - `tools/quality-text/rules/*.mjs` — атомарные правила;
   - `tools/quality-text/config.json` — лимиты и режимы;
   - `tools/quality-text/waivers.json` — временные исключения;
   - `tools/quality-text/reporters/*.mjs` — формат отчётов.
   - Альтернатива: держать всё в одном `tools/testing/check-*.mjs`. Отклонена как плохо масштабируемая.

2. Совместимость команд:
   - каноника: `quality:text*`;
   - совместимость: `test:readability*` как алиасы.
   - Альтернатива: сразу удалить старые команды. Отклонена из-за риска сломать текущие привычные entry points.

3. Deterministic first:
   - обязательный путь использует только локальные статические/AST-проверки;
   - без сетевых вызовов и без LLM.
   - Альтернатива: сразу добавить LLM-линтер в gate. Отклонена по cost и нестабильности.

4. Cost-guardrails для optional LLM-режима (будущее расширение):
   - feature-flag `QUALITY_TEXT_LLM_MODE=off` по умолчанию;
   - hard cap на количество файлов и токенов на запуск;
   - запуск только для changed scope;
   - fallback на deterministic-режим при любом превышении лимитов или ошибке.
   - Альтернатива: unrestricted LLM helper в каждом прогоне. Отклонена как риск катастрофического роста стоимости.

5. Миграция legacy через waivers:
   - waiver обязателен с `owner`, `reason`, `targetStage`;
   - новые нарушения без waiver не допускаются;
   - backlog waivers уменьшается поэтапно.
   - Альтернатива: блокировать весь legacy сразу. Отклонена как блокер разработки.

## Risks / Trade-offs

- [Риск] Дублирование правил между старым и новым контуром на этапе migration.
  → Mitigation: single source of truth в `tools/quality-text/rules`; `test:readability*` только проксирует вызов.

- [Риск] Слишком строгие лимиты тормозят PR.
  → Mitigation: changed-only режим по умолчанию + явные waivers для legacy.

- [Риск] Команда начнёт использовать waivers как постоянную “дыру”.
  → Mitigation: обязательные owner/targetStage и регулярный обзор просроченных waivers.

- [Риск] Попытка добавить LLM в required path повысит стоимость и флейки.
  → Mitigation: запрет LLM в required path на уровне требований и тест-контракта.

## Migration Plan

1. Создать подсистемный каталог `tools/quality-text/**`.
2. Перенести текущую логику checker в engine/rules/config.
3. Подключить новые команды `quality:text*` и оставить `test:readability*` как алиасы.
4. Перенести и нормализовать waiver-реестр в подсистемный формат.
5. Обновить `test:full` и документацию админ/дев-контуров.
6. Прогнать unit + traceability + full и зафиксировать release note для команды.

## Open Questions

- Нужен ли отдельный формат machine-readable отчёта (`json`) в первом релизе подсистемы или достаточно текстового.
- Нужна ли отдельная severity-модель (`error/warn/info`) на первом шаге или достаточно `error` + waiver.
