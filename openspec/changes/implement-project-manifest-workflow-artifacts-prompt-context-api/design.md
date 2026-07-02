## Context

`dispatcher-project` уже удерживает `Project` как основную product boundary, а текущая project wave довела продукт до цепочки `проект -> компоненты -> фокус -> работа`. Но архитектурные подмодули всё ещё мало капитализируются как часть продукта:

- `storage-adapter` остаётся browser-local технической границей;
- `workflow` в основном существует как readout и объясняющий слой;
- `artifacts` описаны в архитектуре, но ещё не ощущаются как first-class объекты работы;
- `prompt-context` существует как внутренний contract LLM-слоя;
- `app/api/**` почти целиком выглядит как внутренний transport layer.

Эта волна должна не просто “разложить код аккуратнее”, а заставить архитектурные сущности работать как переносимые, наблюдаемые и автоматизируемые продуктовые контракты.

## Goals / Non-Goals

**Goals:**

- Сделать `Project` переносимым через manifest-файл и API.
- Сделать `Workflow` повторно используемым как recipe/template.
- Сделать `Artifact` явным проектным материалом, который можно увидеть и включить в manifest/API.
- Сделать `PromptContext` читаемым и частично редактируемым через brief.
- Сохранить продуктовую простоту: архитектура должна становиться понятнее пользователю, а не тяжелее.

**Non-Goals:**

- Не строить полный multi-user/cloud backend.
- Не вводить новый install-critical стек или внешнюю БД.
- Не превращать весь внутренний runtime в публичное API.
- Не закрывать за один change весь future roadmap вокруг Git/Figma/remote sync.

## Decisions

1. В change вводятся два новых внешних контракта: `project-manifest` и `project-api`.

Почему:
- без отдельного manifest project остаётся browser-local состоянием приложения;
- без отдельного API route handlers останутся внутренним транспортом без пользовательской ценности.

Альтернатива:
- ограничиться доработкой текущих `lib/project/*` без новых capability.
- Отклонено: ценность снова останется внутренней.

2. Реализация идёт волнами, но спецификация сразу покрывает весь product-facing набор сущностей.

Почему:
- пользователю и downstream changes нужен цельный вектор продукта, а не набор несвязанных локальных refactor;
- кодовая реализация первой волны может быть уже сейчас наблюдаемой без полной реализации всего roadmap.

Альтернатива:
- реализовывать и специфицировать только manifest.
- Отклонено: это занизит product ambition change и снова оставит `workflow`/`artifacts`/`prompt-context` в тени.

3. Первая волна реализации концентрируется на `project-manifest` и project-facing surfaces, которые можно реально наблюдать через `/projects/<projectId>`.

Состав первой волны:
- экспорт manifest;
- импорт manifest;
- project API foundation для manifest;
- project surface, показывающий manifest/brief/artifacts/template как полезные объекты.

Почему:
- это самый короткий путь от архитектурной границы к видимой пользовательской ценности.

4. `Artifacts` в первой волне не требуют отдельного сложного файлового движка.

Решение:
- сначала artifact library строится на уже существующих project-owned материалах и явных metadata-слоях;
- затем этот contract можно расширять до richer file-backed ресурсов.

Почему:
- это позволяет быстро сделать сущность наблюдаемой без тяжёлой storage migration.

5. `PromptContext` в продукте проявляется через `prompt brief`, а не через полный raw-debug dump.

Почему:
- пользователю нужен управляемый рабочий бриф, а не внутренний JSON целиком;
- при этом system still keeps canonical context contract внутри `lib/prompt/**`.

Альтернатива:
- сразу показать весь raw context.
- Отклонено: это инженерно удобно, но продуктово шумно.

## Risks / Trade-offs

- [Risk] Change может расползтись в слишком широкую “вторую архитектуру продукта”.  
  → Mitigation: держать первую волну вокруг manifest/import-export/API foundation и не уходить в cloud/sync.

- [Risk] API окажется внутренним thin wrapper без самостоятельной ценности.  
  → Mitigation: публиковать через API только manifest, artifacts, workflow templates и brief, а не все внутренние mutation paths.

- [Risk] Artifact layer окажется декоративным readout без рабочих действий.  
  → Mitigation: сразу завязать artifacts на manifest и project surface.

- [Risk] Prompt brief станет дублем project description без реального влияния на LLM-контур.  
  → Mitigation: brief должен входить в canonical prompt-context boundary.

## Migration Plan

1. Добавить OpenSpec delta specs для новых и изменённых capability.
2. Реализовать manifest contract и browser-local import/export без смены install-critical стека.
3. Поверх manifest ввести user-facing API foundation.
4. Подключить manifest/brief/artifacts/template к project page как наблюдаемые объекты.
5. Обновить traceability и unit/source contracts.

Rollback:

- если product-facing layer окажется неготовым, routes и UI можно откатить, сохранив внутренние helper-слои;
- manifest format должен быть additive-friendly и не ломать текущие browser-local проекты.

## Open Questions

- Нужен ли во второй волне отдельный manifest versioning/migration screen для пользователя.
- Нужно ли сразу закладывать artifact attachments beyond metadata, или держать это следующей project-wave.
- Когда `project-api` должен получить write-операции beyond import/export manifest.
