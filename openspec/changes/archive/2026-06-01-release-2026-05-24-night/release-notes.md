# Release Notes: release-2026-05-24-night

Этот файл веду по мере закрытия fix changes из релиза.

Для каждого закрытого fix сюда добавляется:

- краткое описание исправления;
- какие пользовательские симптомы устранены;
- как человек вручную проверяет, что проблема больше не воспроизводится.

## Шаблон записи

### `<fix-change>`

- Что исправлено: `<кратко>`
- Ручная проверка:
  1. `<шаг 1>`
  2. `<шаг 2>`
  3. `<ожидаемый результат>`

### `fix-install-onboarding-first-run-clarity`

- Что исправлено: первый запуск и install-документация теперь объясняют минимальный обязательный путь настройки без лишних шагов и дублирующих переменных.
- Ручная проверка:
  1. Открыть [INSTALL.md](/Users/op/dev/sobakapav/desengine/INSTALL.md), [README.md](/Users/op/dev/sobakapav/desengine/README.md) и [docs/onboarding.md](/Users/op/dev/sobakapav/desengine/docs/onboarding.md).
  2. Пройти глазами сценарий первого запуска: выбрать одного провайдера, задать один ключ, свериться с примером в [desengine.config-example.txt](/Users/op/dev/sobakapav/desengine/desengine.config-example.txt).
  3. Убедиться, что документы не требуют лишних действий, не дублируют `SANDPACK_UI_KIT` и явно объясняют, когда нужен `/system` как repair path.

### `fix-task-reentry-and-reset-determinism`

- Что исправлено: при входе в новый уровень и после reset экран задачи больше не поднимает старые пользовательские файлы и историю от предыдущего уровня.
- Ручная проверка:
  1. Открыть задачу с несколькими уровнями, пройти уровень так, чтобы появились пользовательские изменения.
  2. Перейти на следующий уровень или выполнить reset текущей задачи.
  3. Убедиться, что стартовый экран нового/сброшенного уровня открывается с пустым `taskData` и актуальным контекстом уровня, без файлов прошлого шага.

### `fix-tailwind-preview-arbitrary-values`

- Что исправлено: Sandpack preview использует нормальный Tailwind v4 pipeline, поэтому arbitrary values и ширина компонента в preview больше не ломаются из-за CDN-заглушки.
- Ручная проверка:
  1. Открыть lab/preview сценарий с компонентом, где используются arbitrary Tailwind values вроде `w-[240px]`, `px-[18px]` или похожие utility-классы.
  2. Дождаться сборки preview и сравнить результат с ожидаемой шириной/отступами компонента.
  3. Убедиться, что preview применяет arbitrary values корректно и ширина компонента не схлопывается до дефолтного состояния.

### `fix-release-status-dirty-tag-warning`

- Что исправлено: точный релизный тег больше не маскируется как `development`, если рабочее дерево dirty; вместо этого система показывает отдельную поясняющую пометку.
- Ручная проверка:
  1. Находясь на точном релизном теге, внести локальное несохранённое изменение в рабочее дерево.
  2. Открыть экран `/system` и найти ресурс `system-release`.
  3. Убедиться, что состояние остаётся релизным (`ready`/up-to-date), а в detail появляется пояснение про локальные изменения поверх релизного тега.

### `fix-prompt-counter-single-increment`

- Что исправлено: один пользовательский prompt снова считается как одна попытка, а не как две.
- Ручная проверка:
  1. Открыть задачу на уровне, где виден счётчик использованных prompt-ов.
  2. Отправить ровно один пользовательский prompt через обычный runtime flow.
  3. Убедиться, что `promptsUsed` увеличился только на `1`, а оставшийся лимит уменьшился тоже ровно на одну попытку.

### `fix-smoke-local-config-imports`

- Что исправлено: install/smoke tools больше не используют устаревший путь `../lib/local-config.cjs` и берут локальный конфиг из канонического модуля `../lib/system/config/local.cjs`.
- Ручная проверка:
  1. Открыть [tools/smoke-local-install.mjs](/Users/op/dev/sobakapav/desengine/tools/smoke-local-install.mjs), [tools/repair-onboarding.mjs](/Users/op/dev/sobakapav/desengine/tools/repair-onboarding.mjs) и [tools/generate-allowlist-marker.mjs](/Users/op/dev/sobakapav/desengine/tools/generate-allowlist-marker.mjs).
  2. Убедиться, что во всех трёх местах импорт local config идёт через `../lib/system/config/local.cjs`, а legacy-путь `../lib/local-config.cjs` отсутствует.
  3. При ручном запуске соответствующих CLI-команд проверить, что они стартуют без ошибки `Cannot find module '../lib/local-config.cjs'`.

### `fix-level-3-style-file-contract`

- Что исправлено: level 3 в onboarding и hidden check теперь согласованно требуют канонический файл `styles.ts`, а не устаревший `style.ts`.
- Ручная проверка:
  1. Открыть [onboarding/levels/level-3/overview.md](/Users/op/dev/sobakapav/desengine/onboarding/levels/level-3/overview.md) и [onboarding/prompts/levels/level-3/check.njk](/Users/op/dev/sobakapav/desengine/onboarding/prompts/levels/level-3/check.njk).
  2. Проверить, что в обоих файлах фигурирует пара `Component.tsx` и `styles.ts`, без упоминания `style.ts`.
  3. В самой задаче level 3 убедиться, что текст уровня и hidden check больше не требуют несуществующее имя style-файла.

### `fix-onboarding-cross-device-sync`

- Что исправлено: синхронизация `/onboarding` и repair-path теперь переживают cross-device сценарий с `EXDEV` через fallback `copy + remove`, а не падают на голом `rename`.
- Ручная проверка:
  1. Настроить сценарий, где временный checkout onboarding оказывается на другом диске или устройстве относительно целевого каталога проекта.
  2. Запустить обновление onboarding обычным путём или через repair-flow и дождаться замены каталога `/onboarding`.
  3. Убедиться, что операция не падает на `EXDEV`, каталог заменяется корректно, а содержимое onboarding после sync остаётся валидным.
