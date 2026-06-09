## Tasks

- [x] 1. Локализовать crash-path в `components/desengine/lab/InOut/OutRender/OutRender.tsx` на этапе монтирования `SandpackProvider` / `SandpackPreview`.
- [x] 2. Добавить узкий helper `components/desengine/lab/InOut/OutRender/preview-runtime-webcrypto.ts`, который подставляет детерминированный `crypto.subtle.digest("SHA-256", ...)` только при отсутствии native-реализации.
- [x] 3. Обновить runtime-support в `components/desengine/lab/InOut/OutRender/preview-runtime-notices.tsx`: сначала пытаться установить fallback и монтировать Sandpack как обычно, а notice показывать только если shim не закрепился.
- [x] 4. Обновить regression guard в `test/unit/browser-webcrypto-runtime-boundary.test.ts`, чтобы он фиксировал новый fix-path: попытку узкой подстановки `digest`, отсутствие старого secure-context stopgap и user-facing notice как последний fallback.
- [x] 5. Передать change на внешнюю проверку командой `npm run test:unit -- test/unit/browser-webcrypto-runtime-boundary.test.ts`.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios:
  - `level-labs` / `Пользователь видит референс и результат`
  - `level-labs` / `Пользователь открывает лабораторию уровня`
- [x] Выбрать уровень проверки: `unit` (`source-contract`)
- [x] Зафиксировать команду запуска: `npm run test:unit -- test/unit/browser-webcrypto-runtime-boundary.test.ts`
- [x] Описать mock/fixture-данные: тест читает исходники `components/desengine/lab/InOut/OutRender/OutRender.tsx`, `preview-runtime-notices.tsx` и `preview-runtime-webcrypto.ts`, проверяет попытку установки fallback до отказа от preview и не требует реального браузерного runtime, Sandpack bundler или live backend.
- [x] Live credentials не нужны
- [x] Если финальная runnable-проверка не выполнена этим агентом, оставить её на внешнюю проверку
