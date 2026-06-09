"use client";

import type { ReactNode } from "react";
import { MarkdownContent } from "@/components/desengine/system/MarkdownContent";
import { Button } from "@/components/ui/button";
import { OutRender } from "@/components/desengine/lab/InOut/OutRender/OutRender";
import type { TaskTransition } from "@/lib/task/types";
import { getLevelAssetPath } from "@/lib/level/navigation";

type TaskLevelTransitionProps = {
  transition: TaskTransition;
  started: boolean;
  pending: boolean;
  onContinue: () => void;
  onBackToLevelList: () => void;
};

type TransitionPanelProps = {
  assetBasePath: string;
  description: string;
  title: string;
  children: ReactNode;
};

function TransitionPanel({ assetBasePath, children, description, title }: TransitionPanelProps) {
  return (
    <div className="space-y-2">
      <p className="font-medium">{title}</p>
      {children}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground/80">Общий фокус уровня</p>
        <MarkdownContent
          assetBasePath={assetBasePath}
          className="text-sm text-muted-foreground/80"
          content={description}
        />
      </div>
    </div>
  );
}

function TransitionHeader({ transition, nextLevel }: { transition: TaskTransition; nextLevel: NonNullable<TaskTransition["toLevel"]> }) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground">
        Проверка уровня {transition.fromLevel.number} пройдена
      </p>
      <h1 className="font-semibold">
        {`Задача ${transition.taskId} готова продолжиться на ${nextLevel.title}`}
      </h1>
      <p className="text-muted-foreground">
        Текущий цикл завершён успешно. Следующий уровень открывается как продолжение этой же задачи.
      </p>
    </div>
  );
}

function TransitionActions({
  pending,
  onBackToLevelList,
  onContinue,
}: Pick<TaskLevelTransitionProps, "pending" | "onBackToLevelList" | "onContinue">) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button disabled={pending} onClick={onContinue}>
        Перейти к следующему уровню
      </Button>
      <Button variant="outline" disabled={pending} onClick={onBackToLevelList}>
        Перейти в список задач
      </Button>
    </div>
  );
}

/**
 * @example
 * ```tsx
 * <TaskLevelTransition transition={transition} started pending={false} onContinue={() => {}} onBackToLevelList={() => {}} />
 * ```
 */
export function TaskLevelTransition({
  transition,
  started,
  pending,
  onContinue,
  onBackToLevelList,
}: TaskLevelTransitionProps) {
  const previousLevelTaskText = transition.fromTaskTip
    || `В задаче ${transition.taskId} на уровне ${transition.fromLevel.number} удалось закрепить результат и подготовить переход дальше.`
  const nextLevel = transition.toLevel
  const previousLevelAssetBasePath = getLevelAssetPath(transition.fromLevel.id)

  if (!nextLevel) {
    return null
  }

  const nextLevelTaskText = transition.toTaskTip
    || `В задаче ${transition.taskId} на уровне ${nextLevel.number} начинается следующий шаг с новым дидактическим фокусом.`
  const nextLevelAssetBasePath = getLevelAssetPath(nextLevel.id)

  return (
    <section className="space-y-4 rounded-md border p-6">
      <TransitionHeader transition={transition} nextLevel={nextLevel} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,1fr)]">
        <div className="space-y-4 rounded-md border p-4">
          <TransitionPanel
            assetBasePath={previousLevelAssetBasePath}
            description={transition.fromLevel.description}
            title="Что удалось на предыдущем уровне"
          >
            <MarkdownContent content={previousLevelTaskText} />
          </TransitionPanel>

          <div className="space-y-2">
            <p className="font-medium">Актуальный результат задачи</p>
            <OutRender
              task={transition.taskId}
              started={started}
              reloadKey={0}
              startStatus=""
            />
          </div>
        </div>

        <div className="space-y-2 rounded-md border p-4">
          <TransitionPanel
            assetBasePath={nextLevelAssetBasePath}
            description={nextLevel.description}
            title="Что хочет следующий уровень"
          >
            <MarkdownContent content={nextLevelTaskText} />
          </TransitionPanel>
        </div>
      </div>

      <TransitionActions
        pending={pending}
        onBackToLevelList={onBackToLevelList}
        onContinue={onContinue}
      />
    </section>
  );
}
