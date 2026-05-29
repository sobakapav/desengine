## Миссия

- Что должен изменить этот change: устранить сценарии, в которых preview рендерит DOM без стилей или нестабильно падает, не давая пользователю надёжного styled-preview результата.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix-dispatcher уже выделил preview/runtime как отдельный источник пользовательской нестабильности. Жалобы на “невидимый рендер” и периодические Sandpack failures подтверждают, что defect нужно локализовать в browser runtime contract, а не в одном конкретном task asset.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-bugfix`; этот fix отвечает за живой styled-preview contract и runtime fallback.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/task/spec.md
- openspec/specs/level-labs/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-sandpack-preview-style-runtime: `lib/lab/sandpack-preview.ts`, `lib/lab/sandpack-templates/default/styles.css`, `components/desengine/lab/InOut/OutRender/OutRender.tsx`, `app/api/tasks/[taskId]/sandpack/route.ts`, `test/unit/sandpack-preview.test.ts`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: проверить и закрепить реальное применение preview CSS/Tailwind в браузере, сделать failures диагностируемыми и различимыми, добавить browser-level coverage на styled preview.
- Что сознательно не входит в этот change: полная замена Sandpack на другой движок, install-critical rebuild всего стека, переработка task hints или LLM prompts.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам курс на Sandpack preview и локальные boundary/fallback уже зафиксирован; этот fix чинит их фактическую устойчивость, а не отменяет выбранную архитектуру.

## Проверка результата

- verification_level: component/browser
- verification_command: npm run test:e2e -- test/e2e/sandpack-preview-style-runtime.spec.ts
- Что именно должен доказать результат проверки: preview в живом браузерном runtime действительно применяет стили, а ошибки sandbox/runtime не masquerade как “пустой нормальный рендер”.

## Открытые вопросы

- Нужно ли fallback'ом держать заранее подготовленный CSS-срез, если Tailwind import внутри Sandpack остаётся нестабилен.
- Какие именно пользовательские симптомы относятся к CSS application failure, а какие к bundler/runtime outage.
