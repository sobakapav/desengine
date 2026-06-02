# fix-next-dev-workspace-root-warning

Исполнительский `fix`-change под `dispatcher-install`.

Чинит install/dev-конфигурацию: `npm run dev` не должен предупреждать о неверно определённом workspace root, если рядом лежат лишние lockfile вне каталога приложения.
