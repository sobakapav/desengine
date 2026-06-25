## Context

В active OpenSpec уже оформлена архитектурная линия:

- `producer-architecture-transform` объясняет, почему архитектура стала пользовательски значимой частью продукта;
- `dispatcher-architecture` берёт на себя operational ownership карты, ADR и naming discipline;
- `dispatcher-runtime` выделяет runtime-foundation как первую tactical wave этой линии.

Теперь к этой волне добавляется и доменный project-срез:

- `producer-project` требует реального появления сущности `Project`;
- `dispatcher-project` и его child changes делают это не как isolated feature, а как часть общей архитектурной трансформации продукта.

Но пока у этих changes нет отдельного релизного контейнера, который бы фиксировал общий старт поставки. Из-за этого архитектурная волна хуже читается в release-lineage и смешивается с соседними техничными change-потоками.

## Goals

- Зафиксировать стартовую архитектурную волну как отдельный release.
- Сделать её смысл понятным на уровне продукта, а не только внутренней governance-документации.
- Сохранить независимость стратегического и тактического ownership внутри архитектурной линии.
- Включить первую project-wave как часть той же архитектурной перестройки продукта.

## Non-goals

- Не добавлять в релиз все будущие architecture-facing changes заранее.
- Не переоткрывать содержательные решения `producer-architecture-transform`, `dispatcher-architecture` и `dispatcher-runtime`.
- Не смешивать architecture release с UI- или quality-составом.

## Decisions

1. `release-2026-06-10-architecture` создаётся как отдельная активная релизная метка.

2. Release не должен включать producer и dispatcher changes как физический состав поставки.
   Они задают стратегический и тактический контекст волны, но delivery-состав релиза формируется только через downstream `implement` / `fix`.

3. В этот релиз включается первая domain-wave `Project`, потому что она:
   - прямо меняет верхний контекст продукта;
   - требует явной architectural boundary;
   - синхронизирована с `producer-architecture-transform`.

4. Старт project-wave внутри релиза ограничивается следующими исполнительскими changes:
   - `implement-project-workspace-mvp`;
   - `implement-project-task-onboarding-binding`;
   - `implement-project-workflow-binding`;
   - `implement-project-workbench-preview-binding`;
   - `fix-project-ui-kit-migration-invalidation`;
   - `implement-project-user-surface-foundation`;
   - `implement-project-task-assignment-surface`;
   - `implement-project-config-and-ui-kit-contract`;
   - `implement-project-history-diagnostics-surface`;
   - `implement-project-workflow-readout-surface`.

5. Release в этой волне фиксирует именно старт архитектурной трансформации, а не полноту всех будущих implementation waves.

6. Следующая project-wave внутри того же релиза должна не только строить внутренний runtime contract, но и проявлять проект как пользовательскую сущность:
   - отдельный раздел `Проекты`;
   - отдельную страницу проекта;
   - видимую связь проекта и задач;
   - project-level config и `UI kit` contract;
   - project-scoped историю и диагностику;
   - read-only workflow/artifact surface проекта.

## Risks / Trade-offs

- Если в релиз слишком рано включать все соседние tech changes, архитектурная волна потеряет фокус.
- Если оставить релиз слишком абстрактным, он будет выглядеть декоративной меткой без читаемого состава.
- Если не включить project-wave в этот релиз, архитектурная перестройка продукта снова разойдётся на technical и domain треки без общего delivery-среза.
- По мере появления downstream implementation waves может понадобиться решить, остаются ли они в этом release или открывается следующий архитектурный срез.

## Open Questions

- Какие первые `implement-*` / `fix-*` changes должны стать runtime-составом этого release после появления активной реализации.
- Нужен ли позже отдельный release для второй волны архитектурной трансформации, когда появятся уже не только dispatcher-, но и implementation-level changes.
