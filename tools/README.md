# Admin Tools

## Аудитория

- Администратор локальной установки.
- Инженер сопровождения.

Browser-only пользователь не должен проходить по этому документу для обычной работы с лабораторией.

Root-карта документации:
- первая установка: [INSTALL.md](../INSTALL.md)
- обновление существующей установки: [UPDATE.md](../UPDATE.md)

Канонический каталог админских утилит проекта — `/tools`.

Этот каталог фиксирует:
- инвентаризацию официальных admin tools;
- канонические `npm run ...` команды для их запуска;
- карту миграции со старых путей;
- правила для служебных сценариев сопровождения.

## Инвентаризация

Сейчас к каноническому админскому контуру относятся:

| Назначение | Канонический файл | Каноническая команда |
| --- | --- | --- |
| Smoke-check локальной установки | `tools/smoke-local-install.mjs` | `npm run smoke` |
| Дерево активных OpenSpec changes с summary и role-эмодзи | `tools/list-active-openspec-changes.mjs` | `npm run os` |
| Список релизов и их состав | `tools/list-openspec-releases.mjs` | `npm run os:r` |
| Старт выполнения change с preflight-правилами | `tools/openspec-begin-change.mjs` | `npm run os:begin -- <change>` |
| Диспетчеризация хотелки в implement/fix | `tools/openspec-dispatch-change.mjs` | `npm run os:dispatch -- <dispatcher> --kind fix --name <name> --description "..."` |
| Переименование change с обновлением metadata-ссылок | `tools/rename-openspec-change.mjs` | `npm run os:rename -- <old-name> <new-name>` |
| Контекст implement/fix через parent dispatcher | `tools/openspec-context.mjs` | `npm run os:ctx -- <implement-or-fix-change>` |
| Превращение текстовой хотелки в implement/fix | `tools/openspec-request-to-exec.mjs` | `npm run os:req -- <dispatcher> --request "..." --kind fix` |
| Закрытие implement/fix change | `tools/openspec-close-change.mjs` | `npm run os:close -- <change>` |
| Создание нового OpenSpec change с `short` в metadata | `tools/create-openspec-change.mjs` | `npm run openspec:new -- <name>` |
| Подсистема code quality text | `tools/quality-text/engine.mjs` | `npm run quality:text` |
| Генерация allowlist-маркера | `tools/generate-allowlist-marker.mjs` | `npm run allowlist:marker -- user@example.com` |
| Генерация `config.json` по `base.png` и `variants.png` | `tools/generate-task-configs.mjs` | `npm run admin:tasks:configs` |
| Подготовка task-каталогов из набора PNG | `tools/import-task-assets.mjs` | `npm run admin:tasks:import -- --variants-root=... --base-root=...` |

Каноническими не считаются:
- ad hoc shell-фрагменты;
- machine-specific скрипты с абсолютными путями;
- запуск JS-утилит прямым путём как официальная инструкция, если для них уже есть `npm run ...`.

## Карта миграции

| Старый путь | Новый путь | Каноническая команда |
| --- | --- | --- |
| `scripts/smoke-local-install.mjs` | `tools/smoke-local-install.mjs` | `npm run smoke` |
| `tools/generate-allowlist-marker.mjs` | `tools/generate-allowlist-marker.mjs` | `npm run allowlist:marker -- user@example.com` |
| `utils/config.sh` | `tools/generate-task-configs.mjs` | `npm run admin:tasks:configs` |
| `utils/generate_task_folders.sh` | `tools/import-task-assets.mjs` | `npm run admin:tasks:import -- --variants-root=... --base-root=...` |

## Канонические команды

Этот файл фиксирует только CLI-утилиты из `/tools`. Ручное обновление локального `/onboarding` через кнопку `Обновить onboarding` на `/system` относится к административному контуру, но не считается CLI-admin-tool из `/tools`. Подробности по этому потоку собраны в [docs/onboarding.md](docs/onboarding.md).

### `npm run smoke`

Проверяет:
- версию Node.js;
- наличие `desengine.config.txt`;
- отсутствие устаревшего `.env.local`;
- базовую конфигурацию `OPENAI_API_KEY` и allowlist;
- production build проекта.

### `npm run os`

Печатает дерево активных changes в иерархии `focus → release → idea → producer → dispatcher → implement → fix`.

Роли помечаются эмодзи:
- `🩸` — `focus`
- `🌟` — `release`
- `🦋` — `idea`
- `🍀` — `producer`
- `🔸` — `dispatcher`
- `🔥` — `fix`

Для implement-строк отдельный эмодзи не используется.

Можно подсветить слово в выводе:

```bash
npm run os -- dispatcher
```

В этом режиме совпадения подсвечиваются красным ANSI-цветом, но структура дерева не меняется.

Каждая строка выводится в том же формате, что и `npm run os`:

```bash
<change-name>\t<короткое пояснение>
```

Названия changes первого уровня в listing-командах семейства `os` подсвечиваются ярко-белым ANSI-цветом.

### `npm run os:short`

Печатает тот же active OpenSpec tree-listing, что и `npm run os`, но скрывает исполнительские changes:
- `implement-*`
- `fix-*`

Это полезно, когда нужен обзор стратегических, продюсерских и диспетчерских веток без delivery-шума.

### `npm run os:r`

Печатает список release changes и их состав по полю `release_ref` в виде дерева.
В вывод включаются только активные changes из `openspec/changes`.
Архив `openspec/changes/archive` в этой команде не показывается.

Формат вывода:

```bash
<release-change>\t<короткое пояснение>
  <change>\t<короткое пояснение>
    <child-change>\t<короткое пояснение>
```

### `npm run os:p`

Печатает только те active producer changes, у которых есть связанные implement/fix changes по producer-контексту.

Формат вывода:

```bash
<producer-change>\t<короткое пояснение>
  <implement-or-fix-change>\t<короткое пояснение>
```

Команда включает только implement/fix changes по producer. Producers без привязанных implement/fix в вывод не попадают.

### `npm run os:begin -- <change>`

Запускает preflight перед началом работы над change.

- Прямое изменение кода разрешено только для `implement` и `fix`.
- `focus`, `idea`, `producer`, `dispatcher` и `release` код напрямую не меняют: они управляют downstream changes своего уровня и принимают их результат.
- Если `change_kind=dispatcher`, команда блокирует прямую реализацию, напоминает обязанность создать `implement-*` или `fix-*`, передать inherited roadmap и принять итог работы.
- Для dispatcher команда дополнительно показывает inherited roadmap стратегических владельцев, которыми нужно руководствоваться дальше.
- Для dispatcher можно сразу создать исполнительский change:
  При таком создании команда автоматически гарантирует базовые apply-артефакты (`proposal.md`, `design.md`, `tasks.md`), чтобы старт реализации не блокировался из-за пустого scaffolding.
  Дополнительно создаётся `handoff.md`, который нужно заполнить по существу до старта исполнения.

```bash
npm run os:begin -- dispatcher-... --spawn-implement implement-... --description "..."
```

- Если `change_kind=implement|fix`, команда печатает readiness-поля (`parent_change`, `strategy_root`, `verification_level`, `verification_command`) и напоминает, что стратегия и тактика уже заданы предками.
- Если `handoff.md` отсутствует или в нём остались плейсхолдеры, preflight завершится отказом и потребует завершить handoff.
- Если `change_kind=release`, команда показывает матрицу релиза (`parent dispatcher -> implement/fix`) и подсказывает команду релизной диспетчеризации вместо прямого вмешательства в код.

### `npm run os:dispatch -- <dispatcher> --kind <implement|fix> --name <name>`

Создаёт исполнительский change из dispatcher-контекста и сразу привязывает его к dispatcher.

Пример:

```bash
npm run os:dispatch -- dispatcher-help --kind fix --name ai-policy-typo --description "исправить неточности в AI-политике"
```

Для релизного диспетчерского режима:

```bash
npm run os:dispatch -- release-... --dispatcher dispatcher-... --kind fix --name <name> --description "..."
```

В этом режиме исполнительский change тактически подчиняется `dispatcher` (через `parent_change`), одновременно входит в релиз (через `release_ref`) и при необходимости отдельно помечается `producer_ref`.

Итоговое имя change проходит ту же проверку схемы, что и `openspec:new`: голый суффикс даты вида `-YYYY-MM-DD` на конце запрещён.
Созданный change получает `handoff.md`, который создатель обязан заполнить перед передачей исполнения.

### `npm run os:rename -- <old-name> <new-name>`

Переименовывает change и обновляет структурные metadata-ссылки (`parent_change`, `strategy_root`, `roadmap_ref`, `roadmap_refs`, `release_ref`, `producer_ref`) в других changes.

- Новое имя проходит ту же валидацию, что и создание change.
- Голый суффикс даты вида `-YYYY-MM-DD` на конце запрещён.
- Сам renamed change обновляет собственные текстовые упоминания старого имени в файлах каталога.

### `npm run os:ctx -- <implement-or-fix-change>`

Печатает контекст исполнения для implement/fix:
- какой `parent dispatcher` отвечает за тактику;
- какой `strategy_root` задаёт стратегию;
- к какому `release_ref` относится change;
- в каком `producer_ref` он находится, если producer-контекст задан;
- что код меняется только на уровне implement/fix, а parent dispatcher отвечает за постановку и приёмку результата;
- быстрые пути к `proposal/design/tasks` родительского dispatcher;
- быстрые пути к `proposal/design/tasks` producer, если он задан;
- inherited roadmap стратегических владельцев dispatcher;
- путь к локальному `handoff.md`.

### `npm run os:close -- <implement-or-fix-change>`

Закрывает исполнительский change по каскаду:

1. для `fix` с `verification_level=component/browser` сначала выполняет обязательный browser preflight через канонический wrapper `node tools/testing/run-browser-verification-runtime.mjs ...`;
2. если `verification_command` содержит прямой `npm run test:e2e -- test/e2e/*.spec.ts`, tool автоматически переводит его в тот же wrapper-path;
3. выполняет `npm run test:traceability`;
4. архивирует change в `openspec/changes/archive/YYYY-MM-DD-<change>`.

Wrapper сам:
- поднимает изолированный `next dev`;
- выполняет shell-level target probe через прямой `curl` к `/auth`;
- запускает Playwright-проверку `browser-launch` / `browser-route` через `test/e2e/browser-verification-runtime.spec.ts`;
- форсирует `DESENGINE_E2E_RUNNER=browser-wrapper` и стабильный `PLAYWRIGHT_BROWSER_CHANNEL=chromium`.

Это защищает от двух recurring-problem классов:
- ложного вывода “server down” в средах, где сам Playwright worker не имеет localhost transport, хотя внешний shell-level probe до target server успешен;
- ложного `SIGABRT`/`kill EPERM` в Codex seatbelt, где прямой `npm run test:e2e` не должен считаться валидной browser-приёмкой.

### `npm run os:req -- <dispatcher> --request "..."`

Стандартизирует обработку новой хотелки в dispatcher-контексте:

1. берёт текст хотелки;
2. создаёт `implement` или `fix` change (по `--kind`, по умолчанию `fix`);
3. привязывает его к dispatcher через `os:dispatch`;
4. оставляет создателю заполнить `handoff.md` перед передачей исполнения.

Для release-контекста:

```bash
npm run os:req -- release-... --dispatcher dispatcher-... --request "..." --kind fix
```

### `npm run openspec:new -- <name>`

Создаёт новый OpenSpec change через штатный `openspec new change`, а затем гарантирует, что в `openspec/changes/<name>/.openspec.yaml` есть базовые поля:

```yaml
short_policy: "none"
review_sync_state: "none"
change_kind: "idea"
execution_mode: "no-code"
parent_change: ""
strategy_root: ""
roadmap_ref: ""
release_ref: ""
producer_ref: ""
verification_level: ""
verification_command: ""
issue: ""
short: "краткое описание change"
```

Для dispatcher `roadmap_ref` хранит одиночную ссылку на roadmap стратегического владельца в формате `<change>/roadmaps/<file>.md`.
Если нужен не один roadmap, используется `roadmap_refs` как YAML-список с тем же форматом ссылок.
Если исполнительская ветка работает в контексте конкретного producer, для `implement` и `fix` используется отдельная метка `producer_ref`.
Прямое родительство `dispatcher -> producer` запрещено, и сам `dispatcher` не может хранить `producer_ref`.

Для непустого `short` в changes с `short_policy: strict-v1` действует строгий контракт кастомной схемы:
- начинается с маленькой буквы;
- длина не превышает 75 символов;
- в конце нет знака препинания.

Примеры:

```bash
npm run openspec:new -- add-level-badges
npm run openspec:new -- add-level-badges --schema spec-driven
npm run openspec:new -- add-level-badges --description "Пробный change"
```

Дополнительно команда:
- добавляет тестовый чеклист в `tasks.md`;
- создаёт `handoff.md` для передачи контекста следующему исполнителю.

### `npm run quality:text`

Проверяет читаемость рабочих изменений (working tree + staged):

- лимиты размера файла и функций;
- boolean-trap параметры в экспортируемых API;
- floating promises без явной обработки;
- формат TODO/FIXME.

Временные legacy-исключения ведутся в `tools/quality-text/waivers.json` с обязательными полями `rules`, `owner`, `reason`, `targetStage`.
Отчёт всегда показывает `Scope`, `Files checked`, `Violations`, `Waived violations` и `LLM mode`.
Обязательный путь deterministic: `test:full` не включает LLM, сеть или live credentials.

Полный аудит по репозиторию:

```bash
npm run quality:text:branch
npm run quality:text:repo
```

Совместимые алиасы (migration):

```bash
npm run test:readability
npm run test:readability:branch
npm run test:readability:repo
```

### `npm run allowlist:marker -- user@example.com`

Печатает hex-маркер для allowlist по email и `ALLOWLIST_SALT`.

Дополнительно можно явно передать salt:

```bash
npm run allowlist:marker -- user@example.com --salt=my-secret-salt
```

### `npm run admin:tasks:configs`

Пересобирает `config.json` для всех задач в `onboarding/tasks` по размерам `base.png` и `variants.png`.

Полезные аргументы:

```bash
npm run admin:tasks:configs -- --tasks-root=tasks
npm run admin:tasks:configs -- --tasks-root=onboarding/tasks --max-level=20
```

### `npm run admin:tasks:import -- --variants-root=... --base-root=...`

Создаёт или обновляет task-каталоги и раскладывает туда:
- `variants.png` из каталога variants;
- `base.png` из каталога base по маске `<task-name>-base.png`.

Пример:

```bash
npm run admin:tasks:import -- --variants-root=incoming/variants --base-root=incoming/base --output-root=onboarding/tasks
```

## Правила admin tools

- Канонические admin tools должны жить только в `/tools`.
- Канонические инструкции по ним тоже должны жить в `/tools`.
- Официальный способ запуска admin tools — через `npm run ...`.
- Bash-скрипты не считаются официальным entry point для админского контура.
- Утилиты админского контура не должны зависеть от абсолютных путей конкретной машины.
- Root-документы и профильные docs могут ссылаться на эти команды, но не должны переопределять их форму.
