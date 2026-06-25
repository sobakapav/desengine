## Why

Текущий project contract хранит и прокидывает два разных режима preview/runtime: `ui-kit` и `html-tags`. Для пользователя это оказалось лишней и неустойчивой степенью свободы: проект всё равно должен жить только в режиме полноценного UI kit, а наличие `uiMode` размазывает контракт между storage, prompt, preview, migration и UI.

## What Changes

- Убрать `uiMode` из `ProjectWorkspace`, project-facing UI, runtime/prompt/preview payloads и migration contract.
- Считать, что проект всегда работает только в режиме `ui-kit`.
- Сохранить единственный пользовательский выбор: `uiKitId`.

## Impact

- Project contract становится проще: только `uiKitId`, без скрытого `effective mode`.
- Preview/runtime больше не поддерживает и не рекламирует `html-tags`.
- Downstream tests/OpenSpec переходят на одно-режимный контракт без хвостов `uiMode`.
