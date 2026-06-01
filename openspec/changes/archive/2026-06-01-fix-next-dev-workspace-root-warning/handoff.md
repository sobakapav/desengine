## Миссия

- Что должен изменить этот change: убрать ложное предупреждение Next dev о неверном workspace root при нескольких lockfile рядом с проектом.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-install
- strategy_root: focus-tech
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-install` держит install/setup-контур и ожидает, что локальный запуск продукта не требует ручных конфигурационных патчей после штатной установки.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию install-контура держит `dispatcher-install`; этот fix отвечает за узкий конфигурационный drift вокруг Next dev root detection и за доказательство, что warning больше не навязывается пользователю.

## Обязательные источники

- openspec/changes/dispatcher-install/proposal.md
- openspec/changes/dispatcher-install/design.md
- openspec/changes/dispatcher-install/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-next-dev-workspace-root-warning: `next.config.ts`, `package.json`, `tools/smoke-local-install.mjs`, а также пользовательский документ-источник `https://docs.google.com/document/d/13yc4ovhcnwq0SBsdU6SZTz4Uke_Xip9ZI0sUyEKShQ0/export?format=txt`.

## Границы исполнения

- Что входит в этот change: конфигурационный fix для root-detection warning, репозиторная фиксация канонического app root и regression-guard на этот сценарий.
- Что сознательно не входит в этот change: ускорение runtime, Safari-specific crashes, LLM/auth проблемы и любые install-critical апгрейды стека.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам курс на локальный setup без ручного редактирования конфигов уже принят; этот fix должен убрать конкретный drift, а не перепридумывать install-flow.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/next-dev-workspace-root-warning.test.ts`
- Что именно должен доказать результат проверки: `next.config.ts` явно фиксирует корректный root для dev-режима, а конфигурация больше не оставляет Next.js повода выбирать внешний lockfile как рабочий корень.

## Что исправлено по факту

- Исправленный drift: `next.config.ts` раньше не задавал `turbopack.root`, хотя в `next@16.2.4` warning про ошибочно выбранный workspace root снимается именно этим полем; dev bundler использует `config.turbopack.root || outputFileTracingRoot || dir`.
- Что изменено: в `next.config.ts` добавлен явный `turbopack.root`, привязанный к каталогу самого `next.config.ts`, без изменения остального runtime-конфига.
- Чем это доказано: `test/unit/next-dev-workspace-root-warning.test.ts` теперь покрывает два уровня. Первый фиксирует config shape: `turbopack.root` совпадает с каталогом `next.config.ts`, а `outputFileTracingIncludes` сохранён без дрейфа. Второй поднимает lightweight fixture с двумя `package-lock.json` и через `next/dist/server/config` доказывает runtime-like сценарий: без `turbopack.root` Next эмитит duplicated lockfile warning, с явным `turbopack.root` warning не появляется.

## Что ещё не доказано здесь

- Этот handoff не утверждает полную финальную верификацию живого процесса `next dev`.
- В change уже есть достаточное локальное доказательство symptom/fix-path через Next config loader; финальная внешняя приёмка должна только подтвердить, что test guard действительно проходит в репозитории и не конфликтует с остальным test layer.

## Открытые вопросы

- Достаточно ли unit/source-contract guard, или нужен ещё lightweight smoke на запуск `npm run dev` в окружении с дополнительным lockfile рядом.
