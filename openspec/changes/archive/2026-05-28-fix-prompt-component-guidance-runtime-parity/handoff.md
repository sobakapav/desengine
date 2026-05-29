## Миссия

- Что должен изменить этот change: устранить рассинхрон между prompt/task guidance по компонентам и тем, что реально поддерживает preview/runtime, чтобы система перестала сама провоцировать некорректные импорты.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix-dispatcher уже отделил provider quality от системных контрактных дефектов. В этом кейсе жалоба на “бредовые импорты” локализована не только в поведении модели, но и в наших собственных prompt hints и allowed-components partials.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-bugfix`; этот fix отвечает за компонентный guidance contract между onboarding/prompts и sandbox runtime.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/llm/spec.md
- openspec/specs/task/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-prompt-component-guidance-runtime-parity: `onboarding/prompts/partials/default-allowed-components.njk`, `onboarding/prompts/default.njk`, `onboarding/tasks/mp-inspector-mobile-subject-actions/levels/level-2/tip.md`, `lib/lab/sandpack-preview.ts`, `lib/project/runtime.ts`, `app/api/tasks/[taskId]/sandpack/route.ts`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: определить текущий supported component set для prompt/task/preview flow, выровнять под него общие partials и task hints, закрыть как минимум кейс с `Link` и другими неподдерживаемыми импортами, добавить regression guardrail.
- Что сознательно не входит в этот change: тотальная поддержка всех Next.js/router primitive, общая борьба с галлюцинациями модели, redesign prompt strategy целиком.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: bugfix не должен притворяться полным feature-change для Next runtime внутри Sandpack; если потребуется новая поддержка, она должна быть отдельно явно спроектирована.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/prompt-component-guidance-runtime-parity.test.ts
- Что именно должен доказать результат проверки: guidance больше не рекомендует неподдерживаемые компоненты как безопасный путь по умолчанию; затронутые task hints и общий allowed-components partial согласованы с preview/runtime contract.

## Что изменено

- `onboarding/prompts/partials/default-allowed-components.njk`: общий guidance больше не перечисляет Next/router-компоненты как безопасный дефолт и вместо этого фиксирует реальный путь текущего preview: React-примитивы, существующие `@/components/ui/*` и HTML fallback.
- `onboarding/tasks/mp-inspector-mobile-subject-actions/levels/level-2/tip.md`: подсказка больше не требует `Link` и не ссылается на Next.js-документацию; вместо этого явно разрешает совместимый путь через обычную ссылку `<a>` и сохраняет акцент на семантике и читаемости.
- `openspec/specs/llm/spec.md`: добавлено требование, что общий prompt не обещает неподдерживаемый preview runtime.
- `openspec/specs/task/spec.md`: добавлен сценарий, что task-specific подсказка не требует framework/router-компоненты без штатного preview-окружения.
- `test/unit/prompt-component-guidance-runtime-parity.test.ts`: добавлен regression guardrail, который связывает текст guidance с фактическим default Sandpack runtime.

## Ожидаемое пользовательское поведение

- LLM в стандартном onboarding guidance больше не получает системную подсказку, что `Link`, `Image`, `Head`, `Route` и подобные компоненты безопасны в текущем preview по умолчанию.
- В кейсе `mp-inspector-mobile-subject-actions` пользователь больше не сталкивается с ситуацией, когда система одновременно ругает `<a>` и подталкивает к неподдерживаемому `Link`.
- Если кто-то снова попытается вернуть next/router-компоненты в общий allowed-components partial или потребовать `Link` в этом task hint, unit-guardrail должен упасть.

## Остаточные вопросы

- Этот change сознательно не добавляет host-level диагностику для уже сохранённых пользовательских примеров с неподдерживаемыми импортами; если она нужна, это отдельный scoped change.
- По точечному поиску в обязательных prompt/task файлах drift подтверждён для общего partial и `mp-inspector-mobile-subject-actions`; дальнейший аудит остальных hints стоит делать отдельно, если появятся новые жалобы.
