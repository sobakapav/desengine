import { notFound, redirect } from "next/navigation"

import { requireAccessOrRedirect } from "@/lib/auth/server"
import { createLabLegacyTransitionRedirectPath } from "@/lib/system/navigation"
import { getTaskListItemById, getTaskPendingTransition } from "@/lib/system/server"

type Params = {
  taskId: string
}

export default async function TaskNextPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { taskId } = await params
  const canonicalPath = createLabLegacyTransitionRedirectPath(taskId, "next")

  await requireAccessOrRedirect(canonicalPath)

  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    notFound()
  }

  const transition = await getTaskPendingTransition(taskId)

  if (!transition || !transition.toLevel) {
    redirect(canonicalPath)
  }

  redirect(canonicalPath)
}
