// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользовательский компонент падает во время React-рендера"
// @openSpec  - "Ошибка возникает до React-рендера"
// @openSpec  - "Ошибка возникает внутри React-дерева компонента"
// @openSpec  - "Preview принимает UI-импорты из components/ui"
// @openSpec  - "Клиент запрашивает картинку варианта"
// @openSpec  - "Клиент пытается использовать удалённый дублирующий endpoint"
// @openSpec capability: task-levels
// @openSpec scenarios:
// @openSpec  - "Система читает каталог уровней"
// @openSpec  - "Runtime загружает каталог уровней"
// @openSpec  - "Система читает метаданные задачи"
// @openSpec  - "Система нормализует maxLevel задачи"
// @openSpec  - "Пользователь завершил текущий уровень задачи"
// @openSpec  - "Пользователь впервые входит в новый уровень задачи"
// @openSpec  - "Система загружает конфигурацию уровня"
// @openSpec  - "Новый уровень запрещает файл, существовавший раньше"
// @openSpec  - "Пользователь завершил максимальный уровень задачи"
// @openSpec  - "Пользователь нажал `Я закончил`"
// @openSpec  - "Пользователь открывает результат проверки по каноническому route"
// @openSpec  - "Проверка уровня успешна"
// @openSpec  - "Пользователь запускает проверки результата уровня"
// @openSpec  - "Исчерпан лимит уточняющих промптов уровня"
// @openSpec  - "Пользователь открывает экран уровня"
// @openSpec  - "Пользователь открывает общий обзор уровней"
// @openSpec  - "Пользователь перезагружает открытую задачу"
// @openSpec  - "Пользователь перезагружает экран уровня"
// @openSpec  - "Система читает каталог уровней"
// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает задачу уровня 1"
// @openSpec  - "Открыта задача уровня 1"
// @openSpec  - "Пользователь открывает задачу уровня 2"
// @openSpec  - "Открыта задача уровня 2"
// @openSpec  - "Система загружает контракт лаборатории уровня"
// @openSpec  - "Система читает level-config уровня"
// @openSpec  - "Система читает config уровня с URL"
// @openSpec  - "Уровень не имеет заданного URL"
// @openSpec  - "Система загружает данные уровня"
// @openSpec  - "Система показывает общее пояснение уровня пользователю"
// @openSpec  - "В overview уровня есть ссылка"
// @openSpec  - "В overview уровня есть картинка"
// @openSpec  - "У уровня задан URL дополнительных материалов"
// @openSpec  - "Разработчик открывает config уровня"
// @openSpec  - "Пользователь открывает конкретную задачу на уровне"
// @openSpec  - "Система показывает task-specific пояснение уровня пользователю"
// @openSpec  - "Пользователь открыл задачу внутри уровня"
// @openSpec  - "Система загружает task-specific данные задачи"
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"
// @openSpec  - "Пользователь открывает лабораторию уровня"
// @openSpec  - "Пользователь редактирует один файл и переключается на другой"
// @openSpec  - "Monaco не загрузился"
// @openSpec  - "Основной редактор недоступен"
// @openSpec  - "Пользователь открывает стартовый экран уровня 1 задачи"
// @openSpec  - "Пользователь открывает стартовый экран уровня 2+ задачи"
// @openSpec  - "Результат предыдущего уровня недоступен"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает уточняющий промпт"
// @openSpec  - "Пользователь запускает обычное уточнение после старта"
// @openSpec  - "У уровня есть task-specific tip"
// @openSpec  - "Система собирает текст итерационного промпта"
// @openSpec  - "Система инициирует новый уровень"
// @openSpec  - "Система инициирует новый уровень для уже начатой задачи"
// @openSpec  - "Система собирает текст инициирующего промпта"
// @openSpec  - "Пользователь смотрит на историю уточняющих промптов"
// @openSpec  - "Пользователь сбрасывает задачу"
// @openSpec  - "Пользователь начинает вводить короткое уточнение"
// @openSpec  - "Пользователь вводит многострочный текст"
// @openSpec  - "Пользователь нажимает Enter в непустом поле"
// @openSpec  - "Пользователь нажимает Enter в пустом поле"
// @openSpec  - "Пользователь нажимает Shift+Enter"
// @openSpec  - "Пользователь видит composer уточняющего промпта"
// @openSpec  - "Скрытый инициирующий запуск уровня ещё не завершён"
// @openSpec  - "Система выполняет инициирующий запуск уровня"
// @openSpec  - "Провайдер вернул ошибку"
// @openSpec  - "Лимит текущего уровня ещё не исчерпан"
// @openSpec  - "Лимит текущего уровня исчерпан"
// @openSpec  - "Модель не заполнила служебный файл уровня"
// @openSpec  - "Пользователь открывает историю уточнений"
// @openSpec  - "Пользователь просматривает карточку ранее выполненного уточнения"
// @openSpec  - "Пользователь выполнил несколько уточнений"
// @openSpec  - "Провайдер не вернул реальные метрики"
// @openSpec  - "Система формирует didactic-часть промпта"
// @openSpec  - "Система формирует production-часть промпта"
// @openSpec capability: component-file-set
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает форму уточняющего промпта"
// @openSpec capability: user-progress
// @openSpec scenarios:
// @openSpec  - "Runtime читает и пишет пользовательский прогресс"
// @openSpec  - "Уровень успешно проверен"
// @openSpec  - "В check-result есть успешное прохождение"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("P1 source contracts", () => {
  it("task API имеет канонический image endpoint без duplicate images route", () => {
    const imageRoute = readProjectFile("app", "api", "tasks", "[taskId]", "image", "route.ts")
    const duplicateRoute = path.join(process.cwd(), "app", "api", "tasks", "[taskId]", "images", "route.ts")

    expect(imageRoute).toContain("imageId")
    expect(fs.existsSync(duplicateRoute)).toBe(false)
  })

  it("task runtime применяет fallback/error-boundary контракт для пользовательского render", () => {
    const outRender = readProjectFile("components", "desengine", "lab", "InOut", "OutRender", "OutRender.tsx")
    const sandpackRoute = readProjectFile("app", "api", "tasks", "[taskId]", "sandpack", "route.ts")
    const taskActions = readProjectFile("lib", "task", "actions.ts")

    expect(outRender).toContain("PreviewErrorNotice")
    expect(outRender).toContain("Ошибка загрузки превью")
    expect(outRender).toContain('width: "100%"')
    expect(sandpackRoute).toContain("buildSandpackPreviewPayload")
    expect(sandpackRoute).toContain("readFilesRecursively")
    expect(taskActions).toContain("validateGeneratedFilesPayload")
  })

  it("level/task server читает level catalog, task metadata и строит lab context из level-config", () => {
    const source = readProjectFile("lib", "task", "server.ts")

    expect(source).toContain("readLevelsCatalogRaw")
    expect(source).toContain("LevelsCatalogSchema.parse")
    expect(source).toContain("TaskConfigSchema.parse")
    expect(source).toContain("FORCED_TASK_MAX_LEVEL = 3")
    expect(source).toContain("buildTaskLabContext")
    expect(source).toContain("readLevelCommonExplanation")
    expect(source).toContain("readTaskLevelTip")
    expect(source).toContain("normalizeEditableFileIds")
    expect(source).toContain("requireTaskImage")
  })

  it("user progress читается и пишется только через user-owned progress storage", () => {
    const source = readProjectFile("lib", "task", "server.ts")
    const configSchema = readProjectFile("lib", "system", "schema.ts")

    expect(configSchema).toContain('userRoot = value.userRoot ?? "user"')
    expect(configSchema).toContain("userProgressFile")
    expect(source).toContain("readUserProgressStore")
    expect(source).toContain("writeUserProgressStore")
    expect(source).toContain("appConfig.userProgressFile")
    expect(source).toContain("repairProgressFromCheckResult")
    expect(source).toContain("checkResult.passed")
    expect(source).toContain('checkResult.kind !== "passed"')
    expect(source).toContain('levelProgress.status = "completed"')
    expect(source).toContain("levelProgress.isPassed = true")
    expect(source).toContain("expectedCurrentLevel")
    expect(source).not.toContain("env/user-progress.json")
  })

  it("level transitions, checks, reset и forbidden-file cleanup представлены отдельными server mutations", () => {
    const source = readProjectFile("lib", "task", "server.ts")
    const taskActions = readProjectFile("lib", "task", "actions.ts")

    expect(source).toContain("passCurrentTaskLevelCheck")
    expect(source).toContain("failCurrentTaskLevelCheck")
    expect(source).toContain("markCurrentTaskLevelCheckTechnicalError")
    expect(source).toContain("resetTask")
    expect(source).toContain("removeUserTaskDir")
    expect(taskActions).toContain("cleanupForbiddenWorkbenchFiles")
    expect(taskActions).toContain("cleanupForbiddenWorkbenchFiles")
    expect(taskActions).toContain("passCurrentTaskLevelCheck")
    expect(taskActions).toContain("failCurrentTaskLevelCheck")
  })

  it("level pages and task pages are path-based entry points for reloadable contexts", () => {
    const levelPageExists = fs.existsSync(path.join(process.cwd(), "app", "levels", "[levelId]", "page.tsx"))
    const taskPageExists = fs.existsSync(path.join(process.cwd(), "app", "lab", "[taskId]", "[screen]", "page.tsx"))
    const taskCheckPageExists = fs.existsSync(path.join(process.cwd(), "app", "tasks", "[taskId]", "check", "page.tsx"))
    const taskDonePageExists = fs.existsSync(path.join(process.cwd(), "app", "tasks", "[taskId]", "done", "page.tsx"))
    const taskCheckPage = readProjectFile("app", "tasks", "[taskId]", "check", "page.tsx")
    const taskDonePage = readProjectFile("app", "tasks", "[taskId]", "done", "page.tsx")
    const levelsPage = readProjectFile("app", "levels", "page.tsx")

    expect(levelPageExists).toBe(true)
    expect(taskPageExists).toBe(true)
    expect(taskCheckPageExists).toBe(true)
    expect(taskDonePageExists).toBe(true)
    expect(taskCheckPage).toContain("createTaskCheckPath")
    expect(taskCheckPage).toContain('initScreen={{ type: "check"')
    expect(taskDonePage).toContain("createTaskDonePath")
    expect(taskDonePage).toContain('initScreen={{ type: "done"')
    expect(levelsPage).toContain("getAllLevelOverviews")
  })

  it("start и iterate routes собирают prompt context, enforcing limits and prompt history", () => {
    const taskActions = readProjectFile("lib", "task", "actions.ts")
    const promptComposer = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Propmt",
      "PromptComposer",
      "PromptComposer.tsx",
    )

    expect(taskActions).toContain("buildStartInstruction")
    expect(taskActions).toContain("already")
    expect(taskActions).toContain("normalizeStartPayload")
    expect(taskActions).toContain("blankStartFallbackByFileName")
    expect(taskActions).toContain("markCurrentTaskLevelInitialized")
    expect(taskActions).toContain("promptText")
    expect(taskActions).toContain("promptsUsed >= taskItem.progress.promptsLimit")
    expect(taskActions).toContain("appendPromptHistory")
    expect(taskActions).toContain("TEACHING_COST_PER_ITERATION_CENTS")
    expect(promptComposer).toContain("PromptText")
    expect(promptComposer).toContain("onRun")
  })

  it("UI source contains composer keyboard handling and editor fallback/save flow", () => {
    const workbench = readProjectFile("components", "desengine", "lab", "Workbench", "Workbench.tsx")
    const workbenchView = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchView.tsx")
    const workbenchPrompt = readProjectFile("components", "desengine", "lab", "Workbench", "useWorkbenchPrompt.ts")
    const promptComposer = readProjectFile(
      "components",
      "desengine",
      "lab",
      "Propmt",
      "PromptComposer",
      "PromptComposer.tsx",
    )
    const editor = readProjectFile("components", "desengine", "lab", "Code", "MonacoCodeEditor.tsx")

    expect(workbench).toContain("WorkbenchView")
    expect(workbenchPrompt).toContain("handlePromptKeyDown")
    expect(workbenchView).toContain("Сохранить")
    expect(promptComposer).toContain("onKeyDown")
    expect(promptComposer).toContain("Shift+Enter")
    expect(editor).toContain("FallbackCodeEditor")
    expect(editor).toContain("@monaco-editor/react")
  })
})
