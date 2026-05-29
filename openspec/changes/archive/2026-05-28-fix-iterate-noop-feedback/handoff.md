## Миссия

- Что должен изменить этот change: перестать выдавать no-op iterate за успешное применение уточнения и вернуть пользователю честную обратную связь о том, что код не изменился.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix-dispatcher уже зафиксировал курс на user-visible defects. Здесь жалоба локализована в runtime/UI contract: prompt может считаться “применённым” даже при нуле изменённых файлов.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-bugfix`; этот fix отвечает за iterate result contract и его UI-представление.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/iteration/spec.md
- openspec/specs/user-progress/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-iterate-noop-feedback: `lib/task/actions/iterate.ts`, `components/desengine/lab/Workbench/useWorkbenchPrompt.ts`, `lib/task/server.ts`, `lib/onboarding/repository.ts`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: зафиксировать no-op iterate как отдельный исход, определить его влияние на prompt history и prompt limit, вернуть до UI честный статус вместо ложного “Уточнение применено”.
- Что сознательно не входит в этот change: изменение модели, расширение лимита промптов, provider timeout fixes, redesign prompt composer целиком.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам принцип лимита промптов не меняется без отдельного продуктового решения; этот fix чинит только ложную семантику результата и пользовательский feedback.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/task-iterate-noop-feedback.test.ts
- Что именно должен доказать результат проверки: no-op iterate больше не маскируется как успешное изменение; UI и runtime различают применённый diff и нулевой результат, а расход prompt counter соответствует зафиксированному контракту.

## Открытые вопросы

- Должен ли no-op сжигать попытку полностью или система должна позволять безопасный retry без потери лимита.
- Как лучше различать pure no-op и случай, когда модель пыталась менять только запрещённые файлы.
