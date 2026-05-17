import { AuthScreen } from "@/components/desengine/auth/AuthScreen"
import { redirect } from "next/navigation"

import { getResourceStates } from "@/lib/system/resources/internalstate"
import { getLabRootUrl } from "@/lib/lab/navigation"

export default async function AuthPage() {
  const resources = await getResourceStates()

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
