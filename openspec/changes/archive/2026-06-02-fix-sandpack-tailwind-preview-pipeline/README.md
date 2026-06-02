# fix-sandpack-tailwind-preview-pipeline

Исполнительский `fix`-change под `dispatcher-bugfix`.

Чинит реальный дефект preview-runtime: Sandpack может отрисовать DOM внутри iframe, но не применить preview CSS/Tailwind, из-за чего пользователь получает `unstyled-dom` вместо styled preview.
