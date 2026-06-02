# fix-sandpack-ui-dependency-resolution

Исполнительский `fix`-change под `dispatcher-bugfix`.

Чинит дефект Sandpack preview/runtime: часть shadcn-компонентов из `components/ui` сейчас не распознаётся как поддерживаемая, потому что их транзитивные runtime-зависимости не описаны в `lib/lab/sandpack-ui-kits.config.ts`. Из-за этого компоненты временно выпилены из `components/ui/index.ts`, что скрывает проблему вместо её исправления.
