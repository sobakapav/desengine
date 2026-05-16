import { AuthScreen } from "@/components/desengine/auth/AuthScreen"
import { redirect } from "next/navigation"

import { getSystemStatusModel } from "@/lib/config/status"
import { getLabRootUrl } from "@/lib/lab/navigation"

export default async function AuthPage() {
  const resources = await getSystemStatusModel()

  // ? Здесь точно это нужно?
  if (resources.hasAccess) {
    redirect(getLabRootUrl())
  }

  return (
    <AuthScreen
      authState={resources.authState}
      configured={resources.allowlistConfigured}
      resources={resources.items}
      instructions={resources.instructions}
    />
  )
}