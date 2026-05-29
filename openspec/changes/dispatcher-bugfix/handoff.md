## Миссия

- Зафиксировать `dispatcher-bugfix` как управляющий change для bugfix-потока: он собирает и маршрутизирует воспроизводимые дефекты в отдельные `fix-*` changes, задаёт требования к воспроизведению, доказательству исправления и тестированию, но сам не меняет runtime-код напрямую.

## Унаследованный контекст

- parent_change: focus-quality
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-quality` держит общий quality-контур и ожидает отдельный dispatcher для потока дефектов, чтобы не смешивать локальные bugfix-задачи с redesign, feature-work и другими quality-направлениями.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-quality`, тактическую постановку и маршрутизацию bugfix-потока держит `dispatcher-bugfix`, а кодовые изменения и runnable-проверки выполняются только в дочерних `fix-*` changes.

## Обязательные источники

- openspec/changes/focus-quality/proposal.md
- openspec/changes/focus-quality/design.md
- openspec/changes/focus-quality/tasks.md
- openspec/changes/focus-quality/roadmaps/bugfix-dispatching.md
- openspec/specs/testing-layer/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для dispatcher-bugfix: активные `fix-*` changes и затронутые capability/spec-файлы определяются по конкретному дефекту, который попадает в bugfix-поток.

## Границы исполнения

- Что входит в этот change: описание роли bugfix-dispatcher, правила входа дефекта в отдельный `fix-*` change, требования к воспроизведению, локализации причины, доказательству исправления и явной тестовой части у downstream bugfix-ветки.
- Что сознательно не входит в этот change: непосредственное исправление конкретного бага, выполнение тестов, redesign функциональности, пересмотр стратегического quality-roadmap и любые install-critical изменения.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `focus-quality` уже задаёт стратегический quality-контур, а roadmap `bugfix-dispatching.md` уже определяет, что bugfix-поток отделён от feature/change-потоков и должен завершаться локализованными `fix-*` changes.

## Проверка результата

- verification_level: не применяется для самого dispatcher
- verification_command: не задана; runnable-проверки обязательны на уровне downstream `fix-*` changes
- Что именно должен доказать результат проверки: change оформлен как no-code dispatcher, его границы не заходят в runtime-реализацию, а требования к воспроизведению и тестированию явным образом перенесены на дочерние `fix-*` changes.

## Открытые вопросы

- Какой минимальный набор evidence обязателен для передачи бага в `fix-*` change: только воспроизведение, или ещё локализация suspected cause.
- Нужен ли отдельный producer/change для системных классов багов, если bugfix-поток начнёт стабильно порождать redesign вместо локальных исправлений.
