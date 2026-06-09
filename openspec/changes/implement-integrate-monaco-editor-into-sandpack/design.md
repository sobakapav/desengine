## Контекст

- `openspec/specs/level-labs/spec.md` уже закрепляет Monaco как основной редактор редактируемых файлов и отдельно описывает Sandpack preview как runtime-поверхность лаборатории.
- `openspec/specs/workbench-tools/spec.md` фиксирует, что Monaco и Sandpack должны оставаться `adapt`-интеграциями без протечки их API в сериализуемое состояние Workbench.
- В коде уже существуют отдельные границы для Monaco (`components/desengine/lab/Code/MonacoCodeEditor.tsx`) и Sandpack (`lib/lab/sandpack-preview.ts`, `app/api/tasks/[taskId]/sandpack/route.ts`, `components/desengine/lab/Workbench/*`), но идея единого UX-контура ещё не оформлена как самостоятельный implement change.

## Решение

- Рассматривать интеграцию как UX-change рабочего контура, а не только как внутреннюю техническую перестройку editor adapter.
- Сохранить текущий принцип ownership:
  - Monaco остаётся редакторным инструментом;
  - Sandpack остаётся preview/runtime boundary;
  - Workbench координирует их как единую пользовательскую поверхность без протечки внутренних API наружу.
- При реализации уточнить три слоя:
  - где живёт source of truth для активного файла и его содержимого;
  - как live-preview обновляется из editor state без UX-разрыва;
  - какой fallback получает пользователь, если Monaco или Sandpack временно недоступен.

## Ограничения и риски

- Есть риск превратить UX-change в большой архитектурный рефакторинг Workbench, если не удерживать границу только вокруг интеграции editor/preview.
- Нельзя сломать уже существующие требования `workbench-tools` про адаптерный характер Monaco и Sandpack.
- Если интеграция затронет наблюдаемый контракт лаборатории, потребуется синхронно обновить `openspec/specs/level-labs/spec.md` и, при необходимости, `openspec/specs/workbench-tools/spec.md`.
