import { redirect } from "next/navigation"

import { requireAccessOrRedirect } from "@/lib/auth/server"
import { createLabLegacyTransitionRedirectPath } from "@/lib/system/navigation"

type Params = {
  taskId: string
}

export default async function TaskDonePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { taskId } = await params
  const canonicalPath = createLabLegacyTransitionRedirectPath(taskId, "done")

  await requireAccessOrRedirect(canonicalPath)

  redirect(canonicalPath)
}
