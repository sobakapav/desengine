# Architecture Map AS-IS

## Контекст

Текущая система выросла из локальной образовательной лаборатории для задач по React-компонентам. Код уже содержит сильные основания для продуктового развития, но фактическое ядро всё ещё организовано вокруг одной оси:

```text
onboarding/tasks + onboarding/levels
  -> taskId
  -> текущий level
  -> user/tasks/<taskId>/Component.tsx|styles.ts|mock.ts|props.ts|stories
  -> prompt-history.json
  -> user/user-progress.json
```

Открытые changes уже проектируют более широкий продуктовый контур: `Project`, `Task`, `Workflow`, `Workbench`, `Experience`, `Cost`, `Artifact`, импорт и упаковку. Поэтому главный архитектурный вопрос не в том, как добавить ещё одну фичу в lab, а в том, как эволюционировать текущий lab в платформенное ядро без резкого изменения пользовательского опыта.

## Подсистемы

### Product shell и маршруты

- `app/page.tsx`, `app/system/page.tsx` показывают системную диагностику.
- `app/auth/page.tsx`, `app/api/auth/**` обслуживают allowlist-доступ.
- `app/tasks/**`, `app/lab/**`, `app/levels/**` образуют пользовательский контур задач, уровней и лаборатории.
- `app/help/**` читает локальный help-контент из `help/**`.
- `app/playground/**` и `app/e2e/**` содержат проверочные/демо-страницы.

Проблемная точка: пользовательский task/lab flow раздвоен между `/lab` и `/tasks`. Часть `/lab/[taskId]/check|done|next` редиректит в canonical task paths, а реальные check/done экраны живут в `app/tasks/[taskId]/**`. Это усложняет будущую навигацию workbench/workflow.

### Lab и Workbench

Ключевые файлы:

- `components/desengine/lab/LabScreen/LabScreen.tsx`
- `components/desengine/lab/Workbench/Workbench.tsx`
- `components/desengine/lab/InOut/**`
- `components/desengine/lab/Code/**`
- `components/desengine/lab/Propmt/**`
- `lib/lab/workbench.ts`
- `lib/lab/sandpack-preview.ts`
- `lib/lab/sandpack-template.ts`
- `lib/lab/sandpack-ui-kits.config.ts`

AS-IS поток:

```text
/lab/:taskId
  -> server load: access, taskItem, labContext, taskData, levelOverview
  -> LabScreen client state
  -> TaskLevelStart, если уровень не стартовал
  -> Workbench, если уровень стартовал
```

`Workbench` уже фактически является доменной сущностью, хотя пока не оформлен как контракт. Он объединяет:

- показ входных картинок;
- Sandpack preview результата;
- Monaco/fallback редактор;
- prompt history;
- prompt composer;
- автосейв;
- start/iterate/check/reset actions;
- переходы между уровнями.

Сильная сторона: `editableFileIds` уровня уже фильтруют UI, API save, LLM payload и cleanup запрещённых файлов.

Проблемная точка: Workbench встроен в текущий task-level flow, а не выражен как независимая сущность `WorkbenchDefinition/Instance` с инструментами, состоянием и артефактами.

### Task, Level и User state

Ключевые файлы:

- `lib/task/server.ts`
- `lib/task/progress.ts`
- `lib/task/schema.ts`
- `lib/level/schema.ts`
- `lib/user/server.ts`
- `lib/onboarding/repository.ts`
- `desengine.config.json`

Текущий storage:

```text
onboarding/
  levels/<levelId>/config.json|overview.md|sandpack/*
  tasks/<taskId>/config.json|base.png|variants.png

user/
  user-progress.json
  tasks/<taskId>/*
  check-results/<taskId>.json
```

Сильная сторона: локальная модель понятна, проста и соответствует MVP одного пользователя.

Проблемные точки:

- `lib/task/server.ts` совмещает каталог, прогресс, transitions, восстановление состояния, check-result и reset.
- `FORCED_TASK_MAX_LEVEL = 3` конфликтует с будущими workflow/roadmap/task-model направлениями.
- user state не транзакционный: параллельные autosave/iterate/check/reset могут конфликтовать.
- `isTaskStarted` фактически завязан на наличие рабочих файлов текущего component-flow.

### LLM и Prompt слой

Ключевые файлы:

- `lib/llm/server.ts`
- `lib/llm/types.ts`
- `lib/prompt/server.ts`
- `lib/prompt/render/server.ts`
- `prompts/**`
- `onboarding/prompts/**`

Сильная сторона: LLM adapters уже оформлены таблицей провайдеров, есть typed request/response, error mapping и unit-тесты.

Проблемная точка: `start`, `iterate`, `check` route handlers сами собирают prompt, читают картинки и файлы, вызывают LLM и мутируют state. Это затрудняет reuse для project/dev-mode/workbench и integration tests.

### Sandpack и UI kit

Ключевые файлы:

- `lib/lab/sandpack-preview.ts`
- `lib/lab/sandpack-default-templates.ts`
- `lib/lab/sandpack-templates/default/**`
- `lib/lab/sandpack-ui-kits.config.ts`
- `app/api/tasks/[taskId]/sandpack/route.ts`
- `components/ui/**`

Сильная сторона: Sandpack preview уже использует реальный React/TypeScript runtime, level-owned `App.tsx`, fallback templates и UI kit adapters.

Проблемные точки:

- UI kit сейчас выбирается глобально через env/config, а открытые changes требуют project-level переключение без перезагрузки.
- file set частично задан в `desengine.config.json`, частично hardcoded в Sandpack route/payload builder.
- новые UI kit changes почти полностью дублируют структуру и должны идти после общего adapter contract.

### System, Help и Auth

Ключевые файлы:

- `lib/auth/**`
- `lib/system/resources/**`
- `lib/help/content.ts`
- `app/api/status/llm/route.ts`
- `app/api/system/update/route.ts`
- `app/api/onboarding/update/route.ts`

Сильные стороны:

- route-level access guard уже системно используется на пользовательских страницах;
- help path/id validation и asset guard являются хорошим security pattern;
- resource status отделяет diagnostic content от runtime conditions.

Проблемные точки:

- часть служебных API не использует auth guard;
- system status содержит побочные действия вокруг onboarding sync;
- help/onboarding/task catalog жёстко завязаны на local FS, что станет ограничением для cloud/import/packaging.

### Тестовый слой

Ключевые файлы:

- `test/README.md`
- `test/unit/**`
- `test/e2e/**`
- `test/traceability/spec-coverage-map.json`
- `test/traceability/coverage-plan.json`
- `tools/testing/check-openspec-traceability.mjs`

Сильная сторона: `npm run test:full` уже запускает unit + traceability, а OpenSpec metadata валидируется.

Проблемная точка: много проверок являются source-contract/static. Для lab и API-flow не хватает integration/e2e с mock LLM и fixture user state.

## Архитектурный капитал

- OpenSpec + traceability уже формируют рабочий контур качества.
- Доменные каталоги `lib/task`, `lib/level`, `lib/user`, `lib/llm`, `lib/auth`, `lib/help`, `lib/system` уже физически выделены.
- Zod-схемы дают хорошую основу контрактов.
- LLM adapter table позволяет развивать провайдеры без полного переписывания flow.
- Workbench allowlist и validation защищают generated files от лишних imports и запрещённых файлов.
- Sandpack preview уже поддерживает level-aware templates и UI kit adapters.
- Локальный `user/` storage прост и хорошо подходит для MVP одного пользователя.

## Главный AS-IS вывод

Система готова к эволюции, но следующий рост должен идти через стабилизацию контрактов вокруг текущего lab. Если продолжать добавлять возможности напрямую в существующий task-level runtime, открытые changes начнут создавать параллельные модели `Project`, `Workbench`, `Artifact`, event log и storage.
