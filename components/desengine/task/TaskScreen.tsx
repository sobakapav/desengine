import Link from "next/link"

import type { TaskProjectBinding } from "@/lib/task/assignment"
import type { TaskListItem } from "@/lib/task/types"

import { getProjectUrl } from "@/lib/project/navigation"
import { getTasksRootUrl } from "@/lib/task/navigation"
import { getLabUrl } from "@/lib/lab/navigation"
import { TaskProjectComponentContext } from "@/components/desengine/project/TaskProjectComponentContext"

import { WireFrame } from "../system/WireFrame"

type TaskScreenProps = {
  taskId: string
  taskItem: TaskListItem
  binding: TaskProjectBinding | null
}

function TaskScreenHeader({ binding, taskId }: Pick<TaskScreenProps, "binding" | "taskId">) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="py-2 text-7xl">Задача {taskId}</h1>
        <Link className="rounded-full border border-black px-4 py-2" href={getLabUrl(taskId)}>
          Открыть работу
        </Link>
      </div>

      <p className="max-w-4xl text-xl text-black/70">
        Задача здесь показывает отдельную рабочую сессию внутри проекта. Ниже видно, с каким
        проектом и компонентом она связана, а дальше можно перейти прямо в саму работу.
      </p>
      <TaskProjectComponentContext componentId={binding?.componentId} mode="detail" projectId={binding?.projectId} taskId={taskId} />
    </>
  )
}

function TaskProjectBindingSection({ binding }: Pick<TaskScreenProps, "binding">) {
  const projectLink = binding ? getProjectUrl(binding.projectId) : null

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-3xl">Связанный проект</h2>
      {binding ? (
        <>
          <p className="mt-3 text-lg text-black/80">
            Эта работа уже связана с проектом{" "}
            <Link className="font-medium underline-offset-4 hover:underline" href={projectLink ?? "#"}>
              {binding.projectTitle}
            </Link>
            .
          </p>
          <div className="mt-3">
            <TaskProjectComponentContext componentId={binding.componentId} projectId={binding.projectId} taskId={binding.taskId} />
          </div>
        </>
      ) : (
        <p className="mt-3 text-lg text-black/70">
          Эта работа ещё не привязана к проекту. После первого запуска из страницы проекта связь
          появится и здесь, и в самом проекте.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Link className="rounded-full border border-black px-4 py-2" href={getTasksRootUrl()}>
          Все задачи
        </Link>
        {projectLink ? (
          <Link className="rounded-full border border-black px-4 py-2" href={projectLink}>
            Открыть проект
          </Link>
        ) : null}
      </div>
    </section>
  )
}

function TaskProgressSection({ taskItem }: Pick<TaskScreenProps, "taskItem">) {
  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-black/[0.03] p-6">
      <h2 className="text-3xl">Состояние задачи</h2>
      <dl className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Текущий уровень</dt>
          <dd className="mt-1 text-lg">{taskItem.progress.currentLevel}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Статус уровня</dt>
          <dd className="mt-1 text-lg">{taskItem.progress.currentLevelDisplayStatus}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Осталось промптов</dt>
          <dd className="mt-1 text-lg">{taskItem.progress.promptsRemaining}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Задача завершена</dt>
          <dd className="mt-1 text-lg">{taskItem.progress.isCompleted ? "Да" : "Нет"}</dd>
        </div>
      </dl>
    </section>
  )
}

function TaskScreenWireframe({ taskId }: Pick<TaskScreenProps, "taskId">) {
  return (
    <WireFrame title="Экран задачи" code={`<TaskScreen taskId=${taskId} />`}>
      <WireFrame title="Прогресс по задаче">
        <WireFrame title="Линейка прогресса" />
        <WireFrame title="Ссылка на уровень" />
        <WireFrame title="Описание уровня" />
        <WireFrame title="Сколько осталось промптов на уровне" />
      </WireFrame>
      <WireFrame title="Переход в работу" />

      <WireFrame title="Доступный набор картинок" className="w-full" />

      <WireFrame title="Рендер нынешнего состояния (если есть)" />
      <WireFrame title="Просмотр кода (без редактирования)" />
      <WireFrame title="История задачи" className="flex w-full">
        <WireFrame title="Подсказки пройденных уровней" />
        <WireFrame title="История промптов" />
      </WireFrame>
      <WireFrame title="Бейджи (или теги?)" />
      <WireFrame title="Задать вопрос по задаче" />
      <WireFrame title="Заметка для себя" />
    </WireFrame>
  )
}

function TaskScreen({
  taskId,
  taskItem,
  binding,
}: TaskScreenProps) {
  return (
    <main className="px-5 py-5">
      <TaskScreenHeader binding={binding} taskId={taskId} />
      <TaskProjectBindingSection binding={binding} />
      <TaskProgressSection taskItem={taskItem} />
      <TaskScreenWireframe taskId={taskId} />
    </main>
  )
}

export {
  TaskScreen,
}
