# Roadmap: Onboarding Tasks

## Владелец

`focus-onboarding` владеет roadmap системы задач онбординга и предоставляет его `dispatcher-tasks`.

## Основной фокус

- как устроен task catalog и user-facing identity задач;
- как задачи соотносятся с уровнями, рабочим экраном, прогрессом и переходами;
- как task hints и другой guidance-слой помогают решать задачу, не подменяя сам onboarding UX;
- как изменения task-системы проходят через capability `task`, связанные capability и единый тестовый слой.

## Условия эскалации

- `producer-*`: если требуется отдельный исследовательский контур по развитию task-системы, контентной модели или delivery-приоритетов;
- `implement-*`: если меняется task contract, task metadata, runtime-поведение task/lab flow, task hints или другой user-facing слой задач;
- `fix-*`: если нужно устранить регрессию в task catalog, task UI, task progress, task hints или связанных контрактах.
