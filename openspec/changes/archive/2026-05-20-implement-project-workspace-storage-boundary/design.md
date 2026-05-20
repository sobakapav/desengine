## Context

Текущий `Project` минимален: `id`, `title`, `uiKitId`, `uiMode`. Это хорошо как seed, но опасно как долгосрочный workspace. Следующий шаг должен не расширять Workbench, а создать явную boundary вокруг project lifecycle и storage.

## Proposed Shape

```ts
type ProjectWorkspace = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  settings: {
    uiKitId: string
    uiMode: "html-tags"
  }
}
```

MVP может хранить только один/несколько локальных проектов, но API доступа должен быть готов к расширению.

## Storage Boundary

Минимальный adapter:

```ts
type ProjectStorage = {
  listProjects(): Promise<ProjectWorkspace[]>
  getProject(projectId: string): Promise<ProjectWorkspace | null>
  saveProject(project: ProjectWorkspace): Promise<void>
  getActiveProjectId(): Promise<string | null>
  setActiveProjectId(projectId: string): Promise<void>
}
```

На первом этапе adapter может использовать local/user storage, но вызывающие слои не должны знать физический backend.

## Migration

- Если у задачи есть localStorage key `desengine:project:<taskId>`, Workbench может прочитать его как compatibility input.
- После Project Workspace boundary source of truth должен быть project settings.
- Миграция не должна блокировать открытие существующего lab.

## Testing Strategy

- Unit/contract: normalize/serialize ProjectWorkspace.
- Unit: storage adapter сохраняет/читает active project и settings.
- Source-contract: Workbench/Sandpack не создают второй Project shape.
- Component/browser smoke: переключение UI kit остаётся без перезагрузки.
