"use client";

import { Button } from "@/components/ui/button";
import type { TaskCheckResult, TaskTransition } from "@/lib/task/types";

type TaskCheckResultProps = {
  result: TaskCheckResult;
  transition: TaskTransition | null;
  pending: boolean;
  onContinue: () => void;
  onBackToLab: () => void;
  onRetry: () => void;
};

function getTitle(result: TaskCheckResult, transition: TaskTransition | null) {
  if (result.kind === "passed") {
    return transition?.toLevel
      ? `Проверка пройдена. Уровень ${transition.toLevel.title} уже доступен`
      : `Проверка пройдена. Задача решена целиком`
  }

  if (result.kind === "failed_and_reset") {
    return "Проверка не пройдена. Цикл уровня начнётся заново"
  }

  if (result.kind === "technical_error") {
    return "Проверка временно недоступна"
  }

  return "Проверка не пройдена. Нужно доработать решение"
}

function getMeta(result: TaskCheckResult) {
  if (result.kind === "technical_error") {
    return `Технический сбой на попытке ${result.attemptNumber} из ${result.maxCheckAttempts}. Решение сохранено, можно сразу повторить проверку.`
  }

  if (result.kind === "passed") {
    return `Главный outcome уровня достигнут: проверка уровня ${result.levelNumber} пройдена на попытке ${result.attemptNumber} из ${result.maxCheckAttempts}.`
  }

  const remainingAttempts = Math.max(result.maxCheckAttempts - result.attemptNumber, 0)

  if (result.kind === "failed_and_reset") {
    return `Попытка ${result.attemptNumber} из ${result.maxCheckAttempts} оказалась последней для этого уровня.`
  }

  return `Проверка уровня ${result.levelNumber}, попытка ${result.attemptNumber} из ${result.maxCheckAttempts}. До «Проверка пройдена» осталась доработка и новая проверка. Доступно ещё попыток: ${remainingAttempts}.`
}

/**
 * @example
 * ```tsx
 * <TaskCheckResult result={result} transition={null} pending={false} onContinue={() => {}} onBackToLab={() => {}} onRetry={() => {}} />
 * ```
 */
export function TaskCheckResult({
  result,
  transition,
  pending,
  onContinue,
  onBackToLab,
  onRetry,
}: TaskCheckResultProps) {
  const canContinue = result.kind === "passed"
  const canRetry = result.kind === "technical_error"
  const canReturnToLab = result.kind === "failed" || result.kind === "failed_and_reset"

  return (
    <section className="space-y-4 rounded-md border p-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          {result.levelTitle}
        </p>
        <h1 className="font-semibold">
          {getTitle(result, transition)}
        </h1>
        <p className="text-muted-foreground">
          {getMeta(result)}
        </p>
        <div className="rounded-md border bg-muted/30 p-4">
          <p className="whitespace-pre-wrap text-sm text-foreground">
            {result.message}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {canContinue ? (
          <Button disabled={pending} onClick={onContinue}>
            {transition?.toLevel ? "Вернуться к задачам уровня" : "Открыть итог задачи"}
          </Button>
        ) : null}
        {canReturnToLab ? (
          <Button variant="outline" disabled={pending} onClick={onBackToLab}>
            {result.kind === "failed_and_reset" ? "Начать уровень заново" : "Вернуться к доработке"}
          </Button>
        ) : null}
        {canRetry ? (
          <Button disabled={pending} onClick={onRetry}>
            Повторить проверку сейчас
          </Button>
        ) : null}
      </div>
    </section>
  );
}
