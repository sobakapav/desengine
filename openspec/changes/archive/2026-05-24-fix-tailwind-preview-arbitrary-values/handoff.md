## Миссия

- Что должен изменить этот change: починить применение arbitrary Tailwind values и ширины компонента в preview задач
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-24-night
- producer_ref: (не задан)
- Что из родительского change уже решено: fix входит в релизную волну пользовательских жалоб и должен оставаться узким исправлением preview, без пересмотра install-critical инфраструктуры и без превращения в отдельную feature-ветку. При этом metadata самого fix указывает на UX-орбиту preview, поэтому границы UX-контракта тоже обязательны.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегически change живёт внутри quality-контура `focus-quality`; тактически intake пришёл из bugfix-wave релиза, а UX-ограничения preview задаются governance `dispatcher-ux`, на который указывает metadata fix.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/handoff.md
- openspec/changes/dispatcher-ux/proposal.md
- openspec/changes/dispatcher-ux/design.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-tailwind-preview-arbitrary-values: `openspec/specs/task/spec.md`, `openspec/specs/level-labs/spec.md`, `lib/lab/sandpack-preview.ts`, `lib/lab/sandpack-default-templates.ts`, `lib/lab/sandpack-templates/default/styles.css`, `test/unit/sandpack-preview.test.ts`.

## Границы исполнения

- Что входит в этот change: перевод Sandpack preview на предсказуемую Tailwind-сборку внутри виртуального проекта, восстановление поддержки arbitrary values и ширины компонента, а также обновление OpenSpec/test-артефактов под этот bugfix.
- Что сознательно не входит в этот change: изменение host-layout лаборатории вне preview runtime, пересмотр списка UI kit'ов, смена bundler'а, Node.js, Turbopack или другой install-critical инфраструктуры.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: bugfix остаётся частью релизной волны и quality-контура; отдельные UX-улучшения сверх исправления, новые preview-возможности и любые infra-перестройки остаются за пределами этого fix.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: preview payload больше не зависит от CDN-заглушки Tailwind, виртуальный проект получает Tailwind v4/postcss pipeline, а unit-тесты фиксируют поддержку arbitrary values и корректную ширину preview-компонента на уровне сборки payload.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: достаточно ли unit-покрытия по payload/шаблонам для этого bugfix, и нужно ли отдельным housekeeping-change выровнять конфликт между `handoff` (`dispatcher-bugfix`) и metadata (`dispatcher-ux`).
