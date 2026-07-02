import { redirect } from "next/navigation"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getProjectsRootUrl } from "@/lib/project/navigation"

export default async function Page() {
  await requireAccessOrRedirect(getProjectsRootUrl())
  redirect(getProjectsRootUrl())
}
