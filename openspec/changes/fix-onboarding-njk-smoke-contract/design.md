## Context

Контракт onboarding prompt-layer уже эволюционировал к `.njk`, но часть CLI tooling осталась на старом ожидании `default.md`. В результате у пользователя возникает системный сигнал “локальная установка не готова”, хотя runtime-layout уже соответствует продуктовым правилам.

## Goals

- Сделать onboarding layout validation единым для runtime и tooling.
- Устранить ложные negative results в smoke/repair.

## Non-goals

- Не менять формат реальных onboarding prompts ради обратной совместимости smoke.
- Не расширять scope до синхронизации всего onboarding lifecycle.

## Decisions

1. Канонический contract должен задаваться одним источником.
   - CLI tooling не должно иметь собственную устаревшую копию обязательных onboarding-файлов.

2. `default.njk` остаётся canonical requirement.
   - Legacy `.md` допустим только как runtime fallback там, где это уже отдельно предусмотрено, а не как install-truth.

3. Smoke должен падать только на реальных layout/source проблемах.
   - Если layout валиден, failure не должен возникать из-за расхождения форматов в коде проверок.

## Risks / Trade-offs

- [Риск] При частичной правке smoke и repair останутся несогласованными между собой.
  → Mitigation: свести проверки к общей функции или общему набору обязательных файлов.

- [Риск] Тесты продолжат покрывать runtime, но не tooling.
  → Mitigation: добавить хотя бы один targeted test или smoke-oriented contract check на валидный `.njk` layout.
