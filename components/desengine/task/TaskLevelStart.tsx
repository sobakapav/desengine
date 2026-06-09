"use client"

import { MarkdownContent } from "@/components/desengine/system/MarkdownContent"
import { InPicture } from "@/components/desengine/lab/InOut/InPicture"
import { OutRender } from "@/components/desengine/lab/InOut/OutRender"
import { Button } from "@/components/ui/button"
import { getLevelAssetPath } from "@/lib/level/navigation"

import { type TaskLevelStartProps } from "./props"

type LevelStartIntroProps = {
  currentLevel: number
  isFirstLevel: boolean
  maxLevel: number
  started: boolean
  taskId: string
}

type LevelStartExplanationProps = {
  commonExplanation: string
  levelAssetBasePath?: string
  taskTip: string
}

function LevelStartIntro({
  currentLevel,
  isFirstLevel,
  maxLevel,
  started,
  taskId,
}: LevelStartIntroProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Уровень {currentLevel} из {maxLevel}
      </p>
      <h1 className="text-2xl font-semibold text-black">
        {isFirstLevel && !started
          ? `Довести задачу ${taskId} до состояния «Проверка пройдена»`
          : `Продолжить задачу ${taskId} и пройти проверку уровня ${currentLevel}`}
      </h1>
      <p className="max-w-3xl text-muted-foreground">
        Это старт текущего уровня. После явного старта система подготовит рабочую среду и откроет экран,
        где вы сможете сделать решение и довести его до состояния «Проверка пройдена».
      </p>
    </div>
  )
}

function LevelStartExplanation({
  commonExplanation,
  levelAssetBasePath,
  taskTip,
}: LevelStartExplanationProps) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <p className="font-medium">Что важно на этом уровне</p>
        <MarkdownContent content={taskTip || "Для этого уровня пока нет отдельного пояснения задачи."} />
      </div>

      <div className="space-y-2">
        <p className="font-medium">Общее пояснение уровня</p>
        <MarkdownContent
          assetBasePath={levelAssetBasePath}
          content={commonExplanation || "Общее пояснение уровня пока не заполнено."}
        />
      </div>
    </div>
  )
}

function LevelStartActions({
  startError,
  startStatus,
  onBackToLevelList,
  onStart,
}: Pick<TaskLevelStartProps, "startError" | "startStatus" | "onBackToLevelList" | "onStart">) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="space-y-2">
        <p className="font-medium">Что произойдёт после старта</p>
        <p className="text-muted-foreground">
          Система подготовит файлы именно для этого уровня, сохранит совместимые наработки и затем переведёт
          вас в рабочий экран. Дальше останется один цикл: сделать решение и пройти проверку.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={onStart} disabled={startStatus === "starting"}>
          {startStatus === "starting" ? "Готовим решение…" : "Начать и перейти к решению"}
        </Button>
        <Button variant="outline" onClick={onBackToLevelList} disabled={startStatus === "starting"}>
          К списку задач уровня
        </Button>
      </div>

      {startError ? (
        <pre className="whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive">
          {startError}
        </pre>
      ) : null}
    </div>
  )
}

function LevelImagesPreview({
  hasVisibleImages,
  taskData,
  taskId,
}: {
  hasVisibleImages: boolean
  taskData: TaskLevelStartProps["taskData"]
  taskId: string
}) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="font-medium">Картинки уровня</p>
      {hasVisibleImages ? (
        <InPicture task={taskId} taskData={taskData} />
      ) : (
        <p className="text-muted-foreground">
          Для этого уровня пока нет картинок, доступных к показу.
        </p>
      )}
    </div>
  )
}

function PreviousLevelPreview({
  isFirstLevel,
  taskItem,
  startStatus,
}: Pick<TaskLevelStartProps, "taskItem" | "startStatus"> & { isFirstLevel: boolean }) {
  if (isFirstLevel) {
    return null
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <p className="font-medium">Результат предыдущего уровня</p>
      <OutRender
        task={taskItem.id}
        started={taskItem.started}
        reloadKey={0}
        startStatus={startStatus}
      />
    </div>
  )
}

function TaskLevelStart({
  taskItem,
  taskData,
  startStatus,
  startError,
  onStart,
  onBackToLevelList,
}: TaskLevelStartProps) {
  const { currentLevel, maxLevel } = taskItem.progress
  const isFirstLevel = currentLevel === 1
  const commonExplanation = taskData.labContext?.commonExplanation ?? ""
  const taskTip = taskData.labContext?.taskTip ?? ""
  const levelAssetBasePath = taskData.labContext ? getLevelAssetPath(taskData.labContext.levelId) : undefined
  const hasVisibleImages = (taskData.labContext?.images.filter((image) => image.show).length ?? 0) > 0

  return (
    <section className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      <LevelStartIntro
        currentLevel={currentLevel}
        isFirstLevel={isFirstLevel}
        maxLevel={maxLevel}
        started={taskItem.started}
        taskId={taskItem.id}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,1fr)]">
        <LevelStartExplanation
          commonExplanation={commonExplanation}
          levelAssetBasePath={levelAssetBasePath}
          taskTip={taskTip}
        />
        <LevelStartActions
          startError={startError}
          startStatus={startStatus}
          onBackToLevelList={onBackToLevelList}
          onStart={onStart}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LevelImagesPreview
          hasVisibleImages={hasVisibleImages}
          taskData={taskData}
          taskId={taskItem.id}
        />
        <PreviousLevelPreview
          isFirstLevel={isFirstLevel}
          taskItem={taskItem}
          startStatus={startStatus}
        />
      </div>
    </section>
  )
}

export { TaskLevelStart }
