"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { LevelOverviewTaskItem } from "@/lib/level/types";
import { getLabUrl } from "@/lib/lab/navigation";

type LevelTaskCardProps = {
  task: LevelOverviewTaskItem;
  mode: "available" | "passed";
  pending?: boolean;
  onOpenTask?: (taskId: string) => void;
};

function renderTaskMeta(task: LevelOverviewTaskItem) {
  if (task.progress.currentLevelDisplayStatus === "awaiting_check_retry") {
    return "До состояния «Проверка пройдена» осталась повторная проверка"
  }

  if (task.nextUnlockedLevel !== null) {
    return `Сейчас решается на уровне ${task.nextUnlockedLevel}`
  }

  if (task.progress.isCompleted) {
    return "Задача завершена на своей последней ступени"
  }

  return "Этот уровень уже закрыт"
}

/**
 * @example
 * ```tsx
 * <LevelTaskCard task={task} mode="available" pending={false} onOpenTask={() => {}} />
 * ```
 */
export function LevelTaskCard({
  task,
  mode,
  pending = false,
  onOpenTask,
}: LevelTaskCardProps) {
  return (
    <div className="rounded-md border p-3">
      {mode === "available" ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">{task.id}</p>
            <p className="text-muted-foreground">
              До состояния «Проверка пройдена»: уровень {task.progress.currentLevel} из {task.maxLevel}
            </p>
          </div>
          {onOpenTask ? (
            <Button disabled={pending} onClick={() => onOpenTask(task.id)}>
              Продолжить задачу
            </Button>
          ) : (
            <Link
             
              href={getLabUrl(task.id)}
            >
              Продолжить задачу
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className="font-medium">{task.id}</p>
          <p className="text-muted-foreground">
            {renderTaskMeta(task)}
          </p>
        </>
      )}
    </div>
  );
}
