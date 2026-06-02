## Миссия

- Что должен изменить этот change: убрать последовательную задержку независимых diagnostics probes на auth/system path.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-runtime
- strategy_root: focus-tech
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-runtime` удерживает runtime boundary лаборатории и допускает отдельные fix-срезы для auth, preview и verification path.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию runtime-контура держит `dispatcher-runtime`; этот fix отвечает только за orchestration latency внутри `getResourceStates()`.

## Обязательные источники

- openspec/changes/dispatcher-runtime/proposal.md
- openspec/changes/dispatcher-runtime/design.md
- openspec/specs/resource-status/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-auth-resource-probe-latency: `lib/system/resources/internalstate.ts`, `lib/system/resources/internalstate-sections.ts`, `app/auth/page.tsx`, `app/system/page.tsx`, `test/unit/resource-status.test.ts`.

## Границы исполнения

- Что входит в этот change: локализация serial probe latency, unit-guard и точечный orchestration fix внутри `getResourceStates()`.
- Что сознательно не входит в этот change: изменение текстов ресурсов, таймаутов probes, allowlist semantics, browser verification path, Safari-wide narrative.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: существующий resource model и общая browser verification стратегия уже приняты выше по дереву.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/resource-internalstate.test.ts test/unit/resource-status.test.ts`
- Что именно должен доказать результат проверки: `getResourceStates()` стартует независимые LLM/allowlist probes параллельно и не ломает существующий resource-status contract.

## Открытые вопросы

- Нужна внешняя независимая проверка адресного unit-слоя и review на scope drift.

## Итог реализации

- Локализованный root cause: `getResourceStates()` после базового `Promise.all(...)` последовательно ждал `addLlmResources(...)`, а потом `addAllowlistResources(...)`, хотя оба шага независимы и делают свои network probes.
- Точечный fix: orchestration переведён на параллельный запуск через отдельные временные collectors с последующим стабильным merge в порядке `llm -> allowlist`.
- Добавлен unit `test/unit/resource-internalstate.test.ts`, который падает на serial execution и отдельно удерживает стабильный порядок resource cards после параллельных probes.

## Статус change

- Текущий статус: реализован и внешне принят.
- Что уже закрыто: кодовый fix и адресный unit-guard для orchestration latency.
- Что ещё не закрыто: штатное решение пользователя о дальнейшем движении change в дереве OpenSpec.

## Внешний verdict

- Независимый verifier verdict: `accept`.
- Что подтвердил verifier: probes запускаются параллельно, порядок resource cards удержан стабильным, адресный unit-слой зелёный.

## Изменённые файлы

- `lib/system/resources/internalstate.ts`
- `test/unit/resource-internalstate.test.ts`
- `openspec/changes/fix-auth-resource-probe-latency/.openspec.yaml`
- `openspec/changes/fix-auth-resource-probe-latency/README.md`
- `openspec/changes/fix-auth-resource-probe-latency/proposal.md`
- `openspec/changes/fix-auth-resource-probe-latency/design.md`
- `openspec/changes/fix-auth-resource-probe-latency/tasks.md`
- `openspec/changes/fix-auth-resource-probe-latency/handoff.md`
- `openspec/changes/fix-auth-resource-probe-latency/specs/resource-status/spec.md`

## Проверки и ограничения

- Исполнитель получил адресный red на новом unit до фикса и зелёный локальный прогон после фикса, но это не считается финальной независимой проверкой.
- Для этого change не требуются live credentials и browser path.

## Следующий этап

- Решить, закрывать ли change отдельно или держать его как дополнительный runtime-fix под `dispatcher-runtime`.
