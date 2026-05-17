import type { AppConfig } from "@/lib/system/schema"

import { appConfigSource } from "@/lib/system/config/app"

// Конфиг для client components: без node:fs и без нормализации путей.
// Если понадобится tasksRoot на клиенте, добавим отдельный контракт.
const appConfigClient = appConfigSource as AppConfig

const taskWorkbenchFiles = appConfigClient.taskWorkbenchFiles

export {
    taskWorkbenchFiles
}
