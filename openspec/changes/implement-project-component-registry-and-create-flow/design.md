## Контекст

- Родительский change управляет приоритетом и порядком реализации.
- В продукте уже есть отдельные страницы `/projects` и `/projects/<projectId>`, но они пока не закрывают базовый production path пользователя.
- Workflow уже проявлен как отдельный процесс, однако у проекта ещё нет собственной сущности компонента, к которой можно привязать будущий workflow-run.

## Решение

1. Ввести простую canonical сущность `ProjectComponent`.
   Она живёт внутри `ProjectWorkspace`, хранится отдельно от workflow/runtime состояния и пока описывает только то, что нужно для пользовательского production path:
   - `id`;
   - `projectId`;
   - `title`;
   - `workflowKind`;
   - `status`;
   - `createdAt`;
   - `updatedAt`.

2. Поднять отдельный project-component registry.
   Для текущей волны достаточно canonical project storage рядом с project registry:
   - `/projects` отвечает за создание и список проектов;
   - `/projects/<projectId>` отвечает за создание и список компонентов проекта.

3. Не связывать компонент сразу с активной workflow-сессией или workbench.
   Этот change подготавливает пользовательскую точку входа и canonical container для следующих workflow-изменений, но не переоткрывает model execution целиком.

4. Добавить user-facing surfaces:
   - на `/projects` пользователь может создать новый проект;
   - на `/projects/<projectId>` пользователь видит список компонентов проекта и может создать новый компонент для workflow `image-to-component-workflow`.

## Компромиссы

- Компонентный registry в этой волне остаётся простым и не открывает отдельную multi-user модель поверх server-side project runtime.
  Это допустимо, потому что change закрывает пользовательский path и готовит boundary, а не полную coordination-модель.
- Пока у компонента только один workflow kind.
  Это сознательное ограничение текущей волны: нужно дать реальную production-точку входа, а не проектировать полную матрицу workflow-типов.
