# Decision Memo: следующий архитектурный шаг

## Решение

Следующий архитектурный шаг — не начинать с cloud/electron, Figma import, массового подключения UI kits или большого dev-mode. Сначала нужно укрепить текущий lab runtime как ядро будущего продукта.

Рекомендуемый следующий change:

`implement-lab-runtime-contract-hardening`

## Почему

Текущий lab уже является главным пользовательским опытом системы:

- открытие задачи;
- старт уровня;
- ручное редактирование;
- автосейв;
- Sandpack preview;
- уточняющий prompt;
- проверка результата;
- reset и переходы между уровнями.

Именно через него пройдут будущие `Project`, `UI kit switching`, `Workflow`, `Workbench tools`, `Experience`, `Cost` и импорт. Если сейчас начать наращивать фичи поверх lab без укрепления его контрактов, система быстро получит несколько параллельных моделей навигации, storage, workbench state и event logging.

## Что болит

1. Навигация раздвоена между `/lab` и `/tasks`.
2. Пустой `TaskData` собирается вручную в нескольких местах.
3. `start`, `iterate`, `check` route handlers слишком много знают о prompt, LLM, файловом storage и progress.
4. User state пишется без явной mutation boundary.
5. Текущий e2e слой не проверяет полный lab-flow с mock LLM.
6. UI kit switching и будущий `Project` будут трогать именно эти слабые места.

## Что предлагаем сделать

Сделать hardening-change без радикального UX-редизайна:

- зафиксировать canonical route map для lab/task entry points;
- выделить единую фабрику пустого `TaskData`;
- вынести core flows `start / iterate / check / reset / save files` из route handlers в application service слой;
- добавить минимальную per-task mutation boundary для локального файлового storage;
- добавить integration/e2e smoke с mock LLM и fixture user state;
- сохранить текущий пользовательский сценарий и внешний вид, кроме мелких UX-страховок вокруг ошибок/лимитов.

## Что не делать в этом change

- Не менять стек, сборщик, Sandpack как технологию или Node.js.
- Не вводить полный `Project Workspace`.
- Не подключать новые UI kit'ы.
- Не делать Figma import.
- Не делать cloud/electron packaging.
- Не переписывать lab UI полностью.

## Почему это раньше `project-ui-kit-switching`

`project-ui-kit-switching` должен стать первым видимым продуктовым срезом `Project`, но он затрагивает Sandpack payload, lab state и пользовательский preview. Если сделать его до hardening, он закрепит текущие слабые места как фундамент.

Более безопасный порядок:

1. `implement-lab-runtime-contract-hardening`
2. `dispatcher-project-ui-kit-switching`
3. `research-dev-mode-project-work`
4. `research-task-and-workflow-entities-research`
5. `dispatcher-workbench-entity-workflow-step`

## Вопросы для ревью

1. Должен ли `/lab/:taskId` остаться главным пользовательским URL, а `/tasks/:taskId` — информационной страницей задачи?
2. Нужно ли в этом hardening-change уже снимать e2e skip с `/tasks` и `/levels`, или достаточно добавить отдельный lab-flow smoke?
3. Насколько далеко идти с mutation boundary: минимальная in-process очередь на taskId или сразу файловый lock?

## Рекомендованное допущение для старта

Чтобы не блокировать работу:

- `/lab/:taskId` считаем главным рабочим entry point;
- `/tasks/:taskId` оставляем как task overview/check/done контур совместимости;
- mutation boundary делаем минимальным и локальным, без смены storage;
- e2e smoke добавляем как отдельный lab-flow на mock LLM/fixtures, не требующий live credentials.

## Стабилизационный результат

После реализации первых двух шагов архитектурная ставка подтвердилась:

- `implement-lab-runtime-contract-hardening` отделил core lab actions от HTTP route handlers.
- `dispatcher-project-ui-kit-switching` ввёл минимальный `Project` как boundary между Workbench UI и Sandpack payload.
- Пользовательский lab UX не был капитально изменён: рабочий URL, сценарий редактирования, preview и проверки остались на месте.
- `html-tags` и compatibility status стали диагностируемым состоянием, а не скрытым падением preview.
- `npm run build`, `npm run test:unit` и `npm run test:traceability` проходят.

Ограничение текущего этапа: `Project` пока является локальным lab-preview scope (`id`, `title`, `uiKitId`, `uiMode`) и не заменяет будущий `Project Workspace` со storage, lifecycle, timestamps, artifacts и workflow bindings.

Следующий архитектурный шаг не должен добавлять очередную видимую фичу поверх lab. Сначала нужно сделать обзор границ `TaskActionService`, `Project`, `Workbench`, `SandpackPreview` и решить, какой слой станет владельцем workbench/project state в `research-dev-mode-project-work`.

## Стабилизационные срезы для ревью

Чтобы не смешивать runtime-архитектуру с governance и build-fix деталями, текущую работу нужно ревьюить срезами:

1. `implement-lab-runtime-contract-hardening` — главный архитектурный срез: application service boundary, `TaskData` factory, mutation boundary, canonical routes.
2. `dispatcher-project-ui-kit-switching` — boundary-срез: минимальный `Project` для lab preview и Sandpack compatibility diagnostics.
3. `code-readability-practices-2026-05-19` — governance-срез: правила читаемости и OpenSpec metadata, не prerequisite для runtime stabilization.
4. Build/test stabilization — техническая страховка, чтобы архитектурные изменения не ломали сборку.

Подробный порядок и критерии проверки зафиксированы в `artifacts/review-slices.md`.
