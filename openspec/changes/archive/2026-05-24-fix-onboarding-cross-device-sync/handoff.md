## Миссия

- Что должен изменить этот change: сделать синхронизацию onboarding устойчивой к EXDEV и работе проекта на другом диске
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-install
- strategy_root: focus-tech
- release_ref: release-2026-05-24-night
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-install` уже закрепил, что onboarding sync относится к install/setup/tooling-контуру, должен иметь воспроизводимый локальный сценарий и явную команду проверки, а install-critical стек нельзя менять без отдельного change.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия принадлежит `focus-tech`, тактика install/setup fixes принадлежит `dispatcher-install`, приёмка результата выполняется внешней проверкой по правилам release/fix-потока.

## Обязательные источники

- openspec/changes/dispatcher-install/proposal.md
- openspec/changes/dispatcher-install/design.md
- openspec/changes/dispatcher-install/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-onboarding-cross-device-sync: `openspec/specs/onboarding-repo/spec.md`, `openspec/specs/external-local-onboarding/spec.md`, `lib/onboarding/update.ts`, `tools/repair-onboarding.mjs`, `tools/smoke-local-install/onboarding.mjs`.

## Границы исполнения

- Что входит в этот change: исправление install-time и manual onboarding sync так, чтобы замена каталога `/onboarding` не падала на `EXDEV` при разных дисках/устройствах; выравнивание runtime и CLI repair-path; адресное unit-покрытие этого сценария.
- Что сознательно не входит в этот change: смена UX потока `/system`, изменение источника `ONBOARDING_REPO_URL`, перестройка smoke-flow, изменение install-critical стека, общий рефакторинг onboarding runtime вне причины `EXDEV`.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: ownership install/setup/tooling остаётся у `dispatcher-install`; public docs и пользовательские инструкции не переносятся в этот fix; архитектурная граница между install-контуром и общим runtime/UX не пересматривается.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: что onboarding sync и repair-path сохраняют контракт источника из `ONBOARDING_REPO_URL`, а замена локального `/onboarding` корректно переживает cross-device сценарий с fallback вместо падения на `EXDEV`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: в каких точках используется замена checkout-каталога; как одинаково обработать `EXDEV` в server/runtime и CLI repair; какое минимальное unit-покрытие подтвердит fallback без расширения границ change.
