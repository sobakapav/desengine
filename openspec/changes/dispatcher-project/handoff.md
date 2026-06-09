## Миссия

- Что должен изменить этот change: создать постоянный tactical dispatcher project-линии, чтобы `Project` развивался как явная доменная boundary с downstream implement/fix ветками, а не как scattered локальные инициативы.
- Этот change не меняет runtime напрямую и не подменяет собой producer- или implement-ветки.

## Унаследованный контекст

- parent_change: focus-domain
- strategy_root: focus-domain
- release_ref: (не задан)
- roadmap_ref: focus-domain/roadmaps/workflow.md
- roadmap_refs: focus-domain/roadmaps/workbench.md, focus-domain/roadmaps/ui-kit.md
- Что из родительского change уже решено: `focus-domain` владеет доменными сущностями; `producer-project` уже зафиксировал смысл внедрения сущности `Project`; `producer-architecture-transform` требует явных сущностей, boundary и ownership.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегический product intent по project mode держит `producer-project`, inherited roadmap приходит из `focus-domain`, постоянное tactical ownership project-линии держит `dispatcher-project`, а итоговую приёмку выполняет внешний проверяющий.

## Обязательные источники

- `openspec/changes/focus-domain/proposal.md`
- `openspec/changes/producer-project/proposal.md`
- `openspec/changes/producer-project/design.md`
- `openspec/changes/producer-architecture-transform/proposal.md`

## Границы исполнения

- Что входит в этот change: tactical ownership project boundary, карта downstream project-wave и требования к verification/traceability child changes.
- Что сознательно не входит в этот change: runtime-реализация `ProjectWorkspace`, task binding, workflow binding, workbench binding и progress invalidation.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `focus-domain` уже задаёт доменную topology; `producer-project` уже определил первую волну внедрения сущности `Project` и запретил включать `Project Roadmap` в первую волну.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: новая project-line корректно встроена в OpenSpec topology и готова быть родителем для downstream behavior-change веток.

## Открытые вопросы

- Какие первые implementation-level changes должны брать на себя minimal create/select UX проекта и какие task-layer surfaces обязаны стать project-aware сразу после foundation.
