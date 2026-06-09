## Why

В review релиза `release-2026-06-02-quality` подтвердились несколько разрывов между заявленным контрактом и фактическим поведением:

- storage слой принудительно переводит любой проект в `shadcn/ui-kit`, из-за чего переключение UI kit не работает как пользовательский и runtime-контракт;
- host-side merge preview runtime state скрывает поздний `render-error` после `ready`, поэтому реальная поломка компонента может остаться без явной диагностики;
- browser-подтверждение preview style и Radix runtime path недостаточно надёжно для quality-релиза.

Без этого исправления release notes и archived bugfix changes создают ложное ощущение, что preview/runtime линия уже стабилизирована.

## What Changes

- Снять принудительную миграцию всех `ProjectWorkspace` к `shadcn/ui-kit` и сохранить честный `project.uiKitId/uiMode` в storage boundary.
- Разрешить host diagnostics переводить preview runtime из `ready` в `render-error`, если iframe реально упал после успешного старта.
- Усилить browser-регрессии для `project-ui-kit-switching`, style-contract и Radix preview path.
- Привести release-traceability релиза качества в согласованное состояние там, где она расходится с фактическим составом релиза.

## Impact

- Пользователь снова сможет переключать UI kit без скрытого отката storage к `shadcn`.
- Если preview сначала загрузился, а затем компонент упал, интерфейс покажет явную runtime-диагностику вместо молчаливого `ready`.
- Quality-релиз будет опираться на воспроизводимые browser-доказательства, а не только на unit-покрытие.
