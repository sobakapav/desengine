/**
 * Стартовый экран работы с уровнями
 */

"use client"

import Link from "next/link"

import { MarkdownContent } from "@/components/desengine/system/MarkdownContent"
import { LevelTaskCard } from "@/components/desengine/level/LevelTaskCard"
import { LevelsScreenProps } from "./props"
import { getLevelUrl } from "@/lib/level/navigation"
import type { LevelOverview as LevelOverviewData } from "@/lib/level/types"

type LevelTaskSectionProps = {
    emptyText: string
    mode: "available" | "passed"
    tasks: LevelOverviewData["availableTasks"]
    title: string
}

function LevelsScreenHeader() {
    return (
        <div>
            <div>
                <div>desengine</div>
                <div>
                    <h1>Все уровни</h1>
                    <p>
                        Полный обзор каталога уровней: название, описание и задачи, которые доступны или уже пройдены на каждом уровне.
                    </p>
                </div>
            </div>
        </div>
    )
}

function LevelTaskSection({ emptyText, mode, tasks, title }: LevelTaskSectionProps) {
    return (
        <section>
            <h3 className="font-medium">{title}</h3>
            {tasks.length === 0 ? (
                <p className="text-muted-foreground">{emptyText}</p>
            ) : (
                <div className="space-y-2">
                    {tasks.map((task) => (
                        <LevelTaskCard key={task.id} task={task} mode={mode} />
                    ))}
                </div>
            )}
        </section>
    )
}

function LevelOverviewCard({ overview }: { overview: LevelOverviewData }) {
    return (
        <section className="tool-section-card space-y-4">
            <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-semibold">{overview.level.title}</h2>
                    <Link href={getLevelUrl(overview.level.id)}>
                        Открыть уровень
                    </Link>
                </div>
                <p className="text-muted-foreground">
                    Уровень {overview.level.number}. Лимит промптов на задачу: {overview.level.maxPromptsPerTask}.
                </p>
                <MarkdownContent
                    assetBasePath={getLevelUrl(overview.level.id)}
                    className="max-w-3xl"
                    content={overview.level.description}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <LevelTaskSection
                    emptyText="На этом уровне сейчас нет доступных задач."
                    mode="available"
                    tasks={overview.availableTasks}
                    title="Можно решать сейчас"
                />
                <LevelTaskSection
                    emptyText="Пока ни одна задача не ушла дальше этого уровня."
                    mode="passed"
                    tasks={overview.passedTasks}
                    title="Уровень уже пройден"
                />
            </div>
        </section>
    )
}

function LevelsScreen({overviews}: LevelsScreenProps) {
    return(
        <main>
            <div>
                <section>
                    <LevelsScreenHeader />

                    <div className="mt-6 space-y-6">
                        {overviews.map((overview) => (
                            <LevelOverviewCard key={overview.level.id} overview={overview} />
                        ))}
                    </div>
                </section>
            </div>
        </main>

    )

}

export {
    LevelsScreen
}
