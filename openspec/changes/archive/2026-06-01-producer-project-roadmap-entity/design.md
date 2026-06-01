## Сущность: Project Roadmap (эскиз)

- `ProjectRoadmap`:
  - `id`
  - `projectId`
  - `title`
  - `items[]`
  - `createdAt/updatedAt`

- `RoadmapItem`:
  - `id`
  - `type` (milestone/epic/phase/checklist)
  - `title`
  - `description?`
  - `status` (planned/in_progress/done/blocked/archived)
  - `order?`
  - `dependsOn[]`
  - `taskRefs[]` (ссылки на Task ids)
  - `doneCriteria[]` (чеклист или условия)
  - `tags[]`

## Связь с задачами и workflow

Варианты связи:

- roadmap item порождает задачи (шаблон задач);
- задача прикрепляется к item вручную;
- workflow задач может зависеть от текущего этапа roadmap (например, разные шаги/ограничения).

## Прогресс

MVP модель прогресса:

- прогресс item считается по статусам прикреплённых задач + doneCriteria;
- блокировки/зависимости отображаются явно.

## UX (MVP)

- представление списком (позже — канбан/таймлайн);
- операции: создать item, изменить порядок, связать задачи, отметить done.

## Тестирование (план)

- Unit/contract: сериализация roadmap, зависимости, вычисление прогресса.
- Traceability: сценарии roadmap ↔ тесты.
- E2E smoke (опционально): создать проект → создать roadmap → добавить item → прикрепить задачу → прогресс обновился.

