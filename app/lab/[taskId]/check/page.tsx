import { redirect } from "next/navigation"

import { requireAccessOrRedirect } from "@/lib/auth/server"
import { createTaskCheckPath } from "@/lib/system/navigation"

type Params = {
  taskId: string
}

export default async function TaskCheckPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { taskId } = await params
  const canonicalPath = createTaskCheckPath(taskId)

  await requireAccessOrRedirect(canonicalPath)

  redirect(canonicalPath)
}
