"use client";

import Link from "next/link";
import { MarkdownContent } from "@/components/desengine/system/MarkdownContent";
import { Button } from "@/components/ui/button";
import type { LevelOverview as LevelOverviewData } from "@/lib/level/types";
import { LevelTaskCard } from "../level/LevelTaskCard";
import { getLevelAssetPath, getLevelsRootUrl } from "@/lib/level/navigation";

type LevelOverviewProps = {
  overview: LevelOverviewData;
  pending: boolean;
  onOpenTask: (taskId: string) => void;
  onNavigateLevel: (levelId: string) => void;
};

type LevelTaskSectionProps = {
  emptyText: string;
  mode: "available" | "passed";
  onOpenTask?: (taskId: string) => void;
  pending?: boolean;
  tasks: LevelOverviewData["availableTasks"];
  title: string;
};

function isExternalUrl(url: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)
}

function LevelMaterialLink({ url }: { url: string | null }) {
  if (!url) {
    return null;
  }

  if (isExternalUrl(url)) {
    return (
      <a href={url} rel="noreferrer" target="_blank">
        Дополнительные материалы
      </a>
    );
  }

  return (
    <Link href={url}>
      Дополнительные материалы
    </Link>
  );
}

function LevelHeader({
  overview,
  pending,
  onNavigateLevel,
}: Pick<LevelOverviewProps, "overview" | "pending" | "onNavigateLevel">) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="space-y-1">
        <p className="text-muted-foreground">Экран уровня</p>
        <h1 className="font-semibold">{overview.level.title}</h1>
        <p className="text-muted-foreground">
          Уровень {overview.level.number}. Лимит промптов на задачу: {overview.level.maxPromptsPerTask}.
        </p>
        <MarkdownContent
          assetBasePath={getLevelAssetPath(overview.level.id)}
          className="max-w-3xl"
          content={overview.level.description}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Link href={getLevelsRootUrl()}>
            Открыть все уровни
          </Link>
          <LevelMaterialLink url={overview.level.url ?? null} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={!overview.prevLevelId || pending}
          onClick={() => overview.prevLevelId && onNavigateLevel(overview.prevLevelId)}
        >
          Предыдущий уровень
        </Button>
        <Button
          variant="outline"
          disabled={!overview.nextLevelId || pending}
          onClick={() => overview.nextLevelId && onNavigateLevel(overview.nextLevelId)}
        >
          Следующий уровень
        </Button>
      </div>
    </div>
  );
}

function LevelTaskSection({
  emptyText,
  mode,
  onOpenTask,
  pending,
  tasks,
  title,
}: LevelTaskSectionProps) {
  return (
    <section>
      <h2 className="font-medium">{title}</h2>
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <LevelTaskCard
              key={task.id}
              task={task}
              mode={mode}
              pending={pending}
              onOpenTask={onOpenTask}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * @example
 * ```tsx
 * <LevelOverview overview={overview} pending={false} onOpenTask={() => {}} onNavigateLevel={() => {}} />
 * ```
 */
export function LevelOverview({
  overview,
  pending,
  onOpenTask,
  onNavigateLevel,
}: LevelOverviewProps) {
  return (
    <section className="tool-section-card space-y-6">
      <LevelHeader overview={overview} pending={pending} onNavigateLevel={onNavigateLevel} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LevelTaskSection
          emptyText="На этом уровне сейчас нет доступных задач."
          mode="available"
          onOpenTask={onOpenTask}
          pending={pending}
          tasks={overview.availableTasks}
          title="Можно решать сейчас"
        />
        <LevelTaskSection
          emptyText="Пока ни одна задача не ушла дальше этого уровня."
          mode="passed"
          tasks={overview.passedTasks}
          title="Этот уровень уже пройден"
        />
      </div>
    </section>
  );
}
