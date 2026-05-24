## Миссия

- Что должен изменить этот change: убрать путающие дубли и сделать первый проход установки понятным для неразработчика
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-doc
- strategy_root: focus-public
- release_ref: release-2026-05-24-night
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-doc` отвечает за каноническую карту документации, синхронизацию `README.md`, `INSTALL.md`, `docs/**` и фиксацию наблюдаемого install/runtime-контракта в документах.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-public`, тактику и приоритет документационных fixes задаёт `dispatcher-doc`, приёмка результата остаётся у родительского диспетчера / внешней проверки.

## Обязательные источники

- openspec/changes/dispatcher-doc/proposal.md
- openspec/changes/dispatcher-doc/design.md
- openspec/changes/dispatcher-doc/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-install-onboarding-first-run-clarity: `README.md`, `INSTALL.md`, `docs/onboarding.md`, `docs/access-control.md`, `docs/openai.md`, `docs/deepseek.md`, `docs/gemini.md`, `docs/claude.md`, `docs/zai.md`, `docs/platform-notes.md`, `openspec/specs/external-local-onboarding/spec.md`, `openspec/specs/onboarding-repo/spec.md`.

## Границы исполнения

- Что входит в этот change: упрощение первого install-flow в канонических документах, устранение конфигурационных дублей, синхронизация onboarding-пояснений и исправление относительных ссылок в профильных docs.
- Что сознательно не входит в этот change: изменение runtime-логики синхронизации `/onboarding`, allowlist-механики, provider-адаптеров, install-critical инфраструктуры и release-процедур.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: разделение ролей пользователя и администратора, канонический статус `README.md` и `INSTALL.md`, решение о первичной синхронизации `/onboarding` из `ONBOARDING_REPO_URL`, и наличие repair path через `/system`.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: change не ломает OpenSpec traceability, а обновлённые документы остаются согласованы с capability `external-local-onboarding`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие документы реально участвуют в первом install-flow, где есть дубли или битые ссылки, и как кратко объяснить роль `/system` без противоречия действующим спекам.
