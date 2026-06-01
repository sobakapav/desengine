## Миссия

- Что должен изменить этот change: восстановить поддержку shadcn-компонентов из components/ui, которые выпали из Sandpack из-за непрописанных runtime-зависимостей
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-bugfix` уже квалифицировал этот класс проблем как локальный preview/runtime defect, который нужно чинить через отдельный `fix` без ослабления пользовательского контракта и без маскировки проблемы временными заглушками.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию bugfix-потока держит `dispatcher-bugfix`; этот change отвечает за узкий Sandpack dependency-resolution contract и доказательство того, что проблемные shadcn-компоненты снова реально поддержаны preview-runtime.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/changes/dispatcher-bugfix/design.md
- openspec/changes/dispatcher-bugfix/tasks.md
- openspec/specs/task/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-sandpack-ui-dependency-resolution: `lib/lab/sandpack-ui-kits.config.ts`, `lib/lab/sandpack-preview.ts`, `lib/project/runtime.ts`, `components/ui/index.ts`, проблемные файлы `components/ui/alert-dialog.tsx`, `chart.tsx`, `combobox.tsx`, `command.tsx`, `dialog.tsx`, `drawer.tsx`, `input-otp.tsx`, `resizable.tsx`, `sheet.tsx`, `sidebar.tsx`, `sonner.tsx`, а также `test/unit/sandpack-preview.test.ts`.

## Границы исполнения

- Что входит в этот change: локализация недостающих Sandpack runtime-зависимостей, обновление dependency graph для preview, возврат 11 компонентов в поддерживаемый surface и доказательство, что preview больше не считает их неподдерживаемыми из-за пробелов в конфиге.
- Что сознательно не входит в этот change: расширение preview на новые UI-библиотеки, полная ревизия всего `components/ui`, замена Sandpack, install-critical изменения и unrelated UX/runtime defects.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам факт, что bugfix должен чинить реальный пользовательский дефект, а не скрывать его удалением экспортов; общий governance-курс на явный тестовый след и локальный scope исправления уже задан родителем.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/sandpack-preview.test.ts
- Что именно должен доказать результат проверки: preview builder и Sandpack runtime больше не трактуют эти shadcn-компоненты как неподдерживаемые только потому, что их dependency graph был недоописан; компоненты возвращены в surface осознанно, а не как слепое снятие заглушки.
- Статус проверки: команда `npm run test:unit -- test/unit/sandpack-preview.test.ts` прошла 2026-06-01, результат `1 passed`, `15 tests passed`.
- Добавленные runtime-зависимости shadcn preview: `@base-ui/react`, `input-otp`, `next-themes`, `react-resizable-panels`, `recharts`, `sonner`, `vaul`.
- Уже существующие зависимости, подтвердившие покрытие части возвращаемых компонентов: `@radix-ui/react-alert-dialog`, `@radix-ui/react-dialog`, `cmdk`, `lucide-react`, `class-variance-authority`.
- Добавленный локальный support-файл виртуального проекта: `/src/hooks/use-mobile.ts`, нужен для `components/ui/sidebar-context.tsx`.
- Возвращённый экспортный surface: `alert-dialog`, `chart`, `combobox`, `command`, `dialog`, `drawer`, `input-otp`, `resizable`, `sheet`, `sidebar`, `sonner`.

## Открытые вопросы

- Открытых вопросов по scope этого fix не осталось.
