# Дизайн: растяжение Sandpack preview

## Причина

Sandpack preview рендерится через `@codesandbox/sandpack-react/unstyled` и использует внутренние классы (`.sp-*`). Без явного правила `width: 100%` контейнер/iframe может не заполнять всю ширину доступной колонки результата.

## Решение

1. В `OutRender`:
   - добавить wrapper `w-full` вокруг Sandpack;
   - добавить `width: "100%"` в inline style `SandpackPreview`.
2. В `app/globals.css`:
   - задать `width: 100%` для ключевых `.sp-*` контейнеров, чтобы закрепить поведение независимо от внутренних дефолтов.

## Тестирование

- Source-contract тест фиксирует наличие `width: "100%"` в `OutRender.tsx` (unit/contract слой).

