## Контекст

- `lib/task/schema.ts` сейчас описывает только изображения и `maxLevel`, без `title`.
- `TaskListItem` в `lib/task/types.ts` несёт `id`, `image`, `started`, `maxLevel` и `progress`, но не человекочитаемое имя.
- Пользовательские поверхности уже показывают технический идентификатор задачи, например `components/desengine/task/TaskCard.tsx` и `components/desengine/lab/Workbench/WorkbenchView.tsx`.
- Линия `dispatcher-tasks` требует, чтобы user-facing task experience опирался на понятные для человека сущности, а не только на внутренние slug.

## Решение

- Добавить `title` в source-of-truth конфиг задачи и договориться, что именно он является пользовательским именем задачи.
- Протянуть `title` через schema/types/server-runtime слой:
  - `lib/task/schema.ts`
  - `lib/task/types.ts`
  - `lib/task/server-runtime-overview.ts`
  - при необходимости `lib/task/server-runtime-progress.ts` и связанные проекции.
- Обновить пользовательские task-поверхности так, чтобы они показывали `title` как основной label, а `taskId` оставался только техническим идентификатором там, где он всё ещё нужен.
- Если task title потребуется для templated hints, провести его через существующий prompt-context/task-hints boundary отдельным явным контрактным шагом, а не ad-hoc строкой в UI.

## Ограничения и риски

- `npm run admin:tasks:configs` не должен потерять совместимость с обновлённым `config.json`.
- Если для старых задач нужен backfill `title`, его надо сделать последовательно, не смешивая runtime fallback и долгоживущую миграцию.
- Если название попадает в prompt context, нужно синхронно обновить `openspec/specs/task/spec.md` и, при необходимости, `openspec/specs/prompt-context/spec.md`.
