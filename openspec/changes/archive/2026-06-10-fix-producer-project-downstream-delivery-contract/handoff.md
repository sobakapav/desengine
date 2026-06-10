## Миссия

- Что должен изменить этот change: Довести producer-контракт по downstream decomposition и test/traceability рамке project-волн
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: producer-project
- strategy_root: producer-project
- release_ref: (не задан)
- producer_ref: producer-project
- Что из родительского change уже решено: `producer-project` уже зафиксировал `Project` как новый верхний контекст, обязательный базовый `UI kit`, первый foundation-step для `ProjectWorkspace` и правило, что roadmap не входит в MVP project-wave.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`; этот fix change только устраняет противоречие между его артефактами и доводит delivery/test контракт до конкретного, проверяемого состояния; приёмка идёт по producer-level OpenSpec artifacts и их traceability-валидности.

## Обязательные источники

- openspec/changes/producer-project/proposal.md
- openspec/changes/producer-project/design.md
- openspec/changes/producer-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-producer-project-downstream-delivery-contract: `openspec/changes/producer-project/roadmaps/project-producer.md`, а также review findings, указывающие на gap между обещанной decomposition/test-рамкой и фактическим содержанием producer-артефактов.

## Границы исполнения

- Что входит в этот change: уточнение `proposal.md`, `design.md` и `tasks.md` у `producer-project`; явная фиксация downstream MVP decomposition; явная фиксация verification/test/traceability рамки downstream project-waves; приведение handoff самого fix change в исполнимое состояние для preflight.
- Что сознательно не входит в этот change: runtime/product code, specs runtime-capabilities, release notes и release changes, пересборка уже закрытых downstream changes, изменение project-product decisions beyond producer-level wording.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: `Project` остаётся верхним контекстом, roadmap исключён из MVP, foundation-wave идёт первой, `UI kit` является project-level contract, migration при смене `UI kit` считается тяжёлой операцией.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: producer-level artifacts больше не расходятся между собой, downstream decomposition перечислена явно, а downstream verification contract задан достаточно конкретно для последующей traceability и постановки delivery-waves.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: как сформулировать decomposition так, чтобы она совпадала с уже принятой MVP-wave; как зафиксировать verification matrix без перехода в runtime/spec code; какие task-level формулировки нужно обновить, чтобы снять оба review finding.
