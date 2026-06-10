## Миссия

- Что должен изменить этот change: Починить browser verification runtime wrapper, чтобы команда проверяла все переданные spec-файлы, а не только первый
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-test-system` уже зафиксировал, что изменения test runtime/tooling идут только через downstream `implement`/`fix` changes с явной тестовой частью, traceability и runnable verification path.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику этой волны держит `dispatcher-test-system`, итоговую приёмку выполняет внешний проверяющий.

## Обязательные источники

- openspec/changes/dispatcher-test-system/proposal.md
- openspec/changes/dispatcher-test-system/design.md
- openspec/changes/dispatcher-test-system/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-browser-verification-multi-spec-runtime:
  - `openspec/specs/testing-layer/spec.md`
  - `tools/testing/run-browser-verification-runtime.mjs`
  - `test/unit/browser-verification-runtime.test.ts`

## Границы исполнения

- Что входит в этот change: исправление CLI/runtime wrapper для browser verification, чтобы он передавал в Playwright все spec-файлы из аргументов; обновление unit evidence и OpenSpec bookkeeping этого fix.
- Что сознательно не входит в этот change: изменение самих e2e spec-сценариев, Workbench hydration fix, product runtime, browser-launch policy, target server preflight semantics и install-critical инфраструктуры.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: обязательность wrapper-path для browser verification, требование traceability и правило, что финальную приёмку browser/runtime fixes делает внешний верификатор.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: wrapper больше не теряет дополнительные `.spec.ts` аргументы и формирует runnable Playwright command, который проверяет все переданные browser verification spec-файлы в одном запуске.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - нужен ли отдельный delta-spec для `testing-layer` или достаточно code/tests bookkeeping;
  - как зафиксировать multi-spec forwarding runnable unit evidence без запуска полного browser/e2e слоя локально;
  - какие формулировки в release notes нужны, чтобы явно описать закрытый verification defect.
