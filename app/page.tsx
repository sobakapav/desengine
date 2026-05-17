import { ConfigScreen } from "@/components/desengine/system/SystemScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getResourceStates } from "@/lib/system/resources/internalstate"

export default async function Page() {
  await requireAccessOrRedirect("/")

  const status = await getResourceStates()

  return (
    <ConfigScreen
      authState={status.authState}
      configured={status.allowlistConfigured}
      resources={status.items}
      instructions={status.instructions}
    />
  )
}
