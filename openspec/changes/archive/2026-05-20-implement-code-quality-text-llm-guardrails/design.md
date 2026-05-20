## Решение

Optional LLM-режим на первом шаге является безопасной feature-опцией, а не интеграцией с provider:

- `QUALITY_TEXT_LLM_MODE` по умолчанию считается `off`;
- допустимый активный режим ограничен конфигом и бюджетом;
- если файлов больше `maxFiles` или оценка токенов выше `maxTokens`, отчёт фиксирует fallback в deterministic;
- обязательный путь `quality:text` и `test:full` не делает сетевых или LLM-вызовов.

## Метрики

Отчёт подсистемы должен явно печатать:

- `Scope`;
- `Files checked` / `Проверено файлов`;
- `Violations` / всего нарушений;
- `Waived violations` / нарушений в waiver;
- `LLM mode` / фактический режим после fallback.
