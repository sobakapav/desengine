# Release note: переход на code-quality-text

## Вклад в ближайший релиз

Система обеспечения качества кода создана и проверена на имеющемся коде, результат — в релиз уходит чистый код.

Проверка текущей кодовой базы:

- `npm run quality:text:repo`: `Violations: 0`, `Waived violations: 0`.
- `tools/quality-text/waivers.json`: список исключений пуст.

## Что меняется

Подсистема `code-quality-text` становится каноническим quality-gate для текста кода. Новый основной путь запуска:

```bash
npm run quality:text
npm run quality:text:branch
npm run quality:text:repo
```

Legacy-команды остаются совместимыми alias на период migration:

```bash
npm run test:readability
npm run test:readability:branch
npm run test:readability:repo
```

## Timeline migration

- Этап `6.x`: `test:readability*` остаются alias и не удаляются.
- После закрытия waiver backlog и обновления CI-документации можно создать отдельный follow-up change на deprecation warning.
- Удаление legacy aliases допускается только отдельным OpenSpec change после подтверждения, что внешние pipeline больше их не используют.

## Quality-gate

`npm run test:full` запускает обязательный слой текущего этапа:

```bash
npm run test:unit && npm run test:traceability && npm run quality:text
```

Обязательный путь deterministic: без LLM, без сети и без live credentials.

## Waiver policy

Новые нарушения без waiver блокируют merge. Waiver должен содержать:

- `rules`
- `owner`
- `reason`
- `targetStage`

Полный repo-аудит `npm run quality:text:repo` используется для планирования cleanup-итераций. На старте migration он может показывать legacy backlog, который не должен разом превращаться в неразобранные постоянные исключения.

## Cost guardrails

Optional LLM-режим выключен по умолчанию. Даже при ручном включении через `QUALITY_TEXT_LLM_MODE=optional` подсистема сначала проверяет budget caps и при отсутствии безопасной provider-интеграции возвращается к `fallback:deterministic`.
