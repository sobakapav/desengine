# Playground: Sandpack UI kit'ы

Эта папка — быстрые примеры для проверки, что Sandpack preview действительно подхватывает выбранный UI kit через `SANDPACK_UI_KIT`.

## Как проверить

1) В `desengine.config.txt` выставьте нужный kit:

- `SANDPACK_UI_KIT=shadcn` (по умолчанию)
- `SANDPACK_UI_KIT=ant`
- `SANDPACK_UI_KIT=mui`
- `SANDPACK_UI_KIT=none`

2) Перезапустите dev-сервер.

3) Откройте любую задачу и временно замените содержимое `Component.tsx` на один из файлов из этой папки:

- `Component.shadcn.tsx`
- `Component.ant.tsx`
- `Component.mui.tsx`
- `Component.none.tsx`

Ожидаемое поведение:
- при несовпадении kit'а импорты будут падать (это нормально);
- при совпадении kit'а компонент рендерится без ошибок и использует компоненты выбранной библиотеки.

