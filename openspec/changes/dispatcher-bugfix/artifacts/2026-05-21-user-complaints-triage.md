# Triage: жалобы пользователей от 2026-05-21

Источник: Google Doc `Баги/вопросы студентов/наши`.

Ни одна жалоба не оставлена без решения. Для каждой зафиксирован статус:

- `в работу` — создан downstream `fix` change;
- `отказ` — жалоба не берётся в bugfix-wave, указан аргумент.

## В работу

1. Пропадает описание при повторном входе в уже решённую задачу.
Статус: `в работу`
Fix: `fix-task-reentry-and-reset-determinism`

2. После завершения уровня пользователь попадает в противоречивое состояние перехода/возврата.
Статус: `в работу`
Fix: `fix-task-reentry-and-reset-determinism`

3. После reset меняются preview и код как будто это уже другой вариант той же задачи.
Статус: `в работу`
Fix: `fix-task-reentry-and-reset-determinism`

4. В задаче `dipole-button` пользователь видит не тот исходный артефакт, а reset временно это чинит.
Статус: `в работу`
Fix: `fix-task-reentry-and-reset-determinism`

5. Первый проход установки путает неразработчика: дубли ссылок, непонятные Node.js/npm, неочевидный терминал, пугающие технические секции.
Статус: `в работу`
Fix: `fix-install-onboarding-first-run-clarity`

6. Ограничения tunnel/aggregator-провайдеров не объяснены заранее.
Статус: `в работу`
Fix: `fix-install-onboarding-first-run-clarity`

7. Стартовые тексты перегружены и плохо сканируются.
Статус: `в работу`
Fix: `fix-install-onboarding-first-run-clarity`

8. Arbitrary Tailwind values не применяются в preview, а компонент растягивается по ширине.
Статус: `в работу`
Fix: `fix-tailwind-preview-arbitrary-values`

9. После обновления до релизного тега UI говорит, что система в нерелизной версии.
Статус: `в работу`
Fix: `fix-release-status-dirty-tag-warning`

10. Счётчик промптов прыгает с `0` до `2`; на уровне фактически не хватает попыток.
Статус: `в работу`
Fix: `fix-prompt-counter-single-increment`

11. На Windows onboarding sync падает на `EXDEV`, если проект и temp лежат на разных дисках.
Статус: `в работу`
Fix: `fix-onboarding-cross-device-sync`

12. `npm run smoke` падает из-за устаревших импортов `local-config.cjs`.
Статус: `в работу`
Fix: `fix-smoke-local-config-imports`

13. Level 3 противоречит сам себе по имени style-файла (`styles.ts` / `style.ts` / `style.css`).
Статус: `в работу`
Fix: `fix-level-3-style-file-contract`

## Отказ

1. «Система показывает, что доступа нет, когда он есть».
Статус: `отказ`
Аргумент: жалоба недостаточно воспроизводима для корректного `fix`. Не указаны экран, URL, ответ allowlist/LLM-проверки и состояние авторизации. Без этого получится гадание, а не bugfix.

2. «OpenAI API недоступен по сети… помогло остановить терминал и запустить заново».
Статус: `отказ`
Аргумент: это выглядит как единичный operational/network incident, а не как подтверждённый стабильный дефект текущего продукта. Для fix не хватает воспроизводимого сценария и признаков системного корня.

3. «Сделать адаптер для Claude».
Статус: `отказ`
Аргумент: это не bug, а feature request; кроме того, Claude уже поддержан в текущем дереве (`lib/llm/adapters.ts`, archived change `2026-05-18-claude-llm-adapter`).

4. «Сделать адаптер для z.ai».
Статус: `отказ`
Аргумент: это не bug, а feature request; Z.AI уже поддержан в текущем дереве (`lib/llm/adapters.ts`, `openspec/specs/zai/spec.md`, archived change `2026-05-18-zai-llm-adapter`).

5. Bug report про `DESENGINE_LLM_PROVIDER` / `DESENGINE_DEEPSEEK_MODEL` / `DESENGINE_DEEPSEEK_BASE_URL`.
Статус: `отказ`
Аргумент: текущий контракт репозитория использует короткие имена `LLM_PROVIDER`, `DEEPSEEK_MODEL`, `DEEPSEEK_BASE_URL`, и код ему соответствует (`desengine.config-example.txt`, `INSTALL.md`, `lib/llm/adapters.ts`, `test/unit/llm.server.deepseek.test.ts`). Жалоба относится к другому или устаревшему состоянию.

6. «Также требуется `DESENGINE_ONBOARDING_REPO_URL`, а в конфиге указано `ONBOARDING_REPO_URL`».
Статус: `отказ`
Аргумент: текущий продуктовый контракт канонически использует `ONBOARDING_REPO_URL` (`openspec/specs/onboarding-repo/spec.md`, `lib/onboarding/update.ts`, `README.md`). Жалоба не соответствует текущему репозиторию.

7. Bug report: после проверки задачи приложение переходит на 404.
Статус: `отказ`
Аргумент: в текущем дереве существует UI-маршрут [app/tasks/[taskId]/check/page.tsx](/Users/op/dev/sobakapav/desengine/app/tasks/[taskId]/check/page.tsx), а path builder ведёт именно в него ([lib/task/navigation.ts](/Users/op/dev/sobakapav/desengine/lib/task/navigation.ts)). Жалоба устарела относительно текущей ветки.

8. «TimelineLine не растягивается на ожидаемую ширину».
Статус: `отказ`
Аргумент: сама жалоба содержит корректный разбор, что компонент растягивается по ширине родителя и баг локализуется не в компоненте, а в ожидании к контейнеру preview. Отдельного подтверждённого дефекта текущего runtime из этого не следует.

9. «После завершения задачи удобнее сразу возвращаться к списку задач уровня».
Статус: `отказ`
Аргумент: это product/UX preference, а не bug текущего контракта. Действующая спецификация прямо говорит, что следующий уровень открывается сразу как текущий (`openspec/specs/task-levels/spec.md`).

10. «Неплохо бы подсвечивать, что именно было изменено после правильного кода».
Статус: `отказ`
Аргумент: это feature request, не bug.

11. «Поле с кодом бесконечно растягивается вправо».
Статус: `отказ`
Аргумент: жалоба уже закрыта в текущем дереве archived change `2026-05-21-fix-lab-editor-width`.

12. «Рядом с Component.tsx не появляется поле со стилями».
Статус: `отказ`
Аргумент: текущий workbench-конфиг уже включает `styles.ts` как отдельную вкладку ([components/desengine/lab/Workbench/config.ts](/Users/op/dev/sobakapav/desengine/components/desengine/lab/Workbench/config.ts)), а действующий контракт уровня тоже её описывает (`openspec/specs/level-labs/spec.md`). Жалоба выглядит исторической.

13. «Система стала чудовищно тормозить».
Статус: `отказ`
Аргумент: для fix не хватает воспроизводимого сценария, уровня, действия и измеримого симптома. Нужен отдельный perf-report, иначе change получится без проверяемой цели.

14. Casing/build issue при обновлении `0.1.4 -> 0.1.5`.
Статус: `отказ`
Аргумент: жалоба выглядит исторической для старой раскладки путей. В текущем дереве используется нижний регистр `components/desengine/lab/**`, поэтому bug не подтверждается на текущей ветке.
