## Контекст

- Родительский `dispatcher-install` владеет install/setup/tooling-контуром и требует, чтобы config-contract не расходился молча.
- После переезда локального конфига в `lib/system/config/local.cjs` часть install-tools осталась на старом require-пути `../lib/local-config.cjs`.
- Из-за этого `npm run smoke` и соседние admin-tools падают раньше фактической диагностики setup-состояния.

## Решение

- Перевести install-tools на канонический модуль `lib/system/config/local.cjs` без изменения CLI-команд и пользовательских сообщений.
- Зафиксировать source-contract тестом, что `smoke`, `repair-onboarding` и `allowlist:marker` больше не используют legacy-import путь.
- Не менять формат `desengine.config.txt`, runtime загрузку конфига в приложении и install-critical инфраструктуру.
