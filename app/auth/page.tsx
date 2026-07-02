import { AuthScreen } from "@/components/desengine/auth/AuthScreen"
import { redirect } from "next/navigation"

import { getResourceStates } from "@/lib/system/resources/internalstate"
import { getProjectsRootUrl } from "@/lib/project/navigation"

/**
 * @example
 * ```tsx
 * <AuthPage />
 * ```
 */
export default async function AuthPage() {
  const resources = await getResourceStates()

  if (resources.hasAccess) {
    redirect(getProjectsRootUrl())
  }

  return (
    <>
      <style>
        {`
          body {
            background: #1e293b;
          }
        `}
      </style>

      <AuthScreen
        authState={resources.authState}
        configured={resources.allowlistConfigured}
        resources={resources.items}
        instructions={resources.instructions}
      />
    </>
  )
}
