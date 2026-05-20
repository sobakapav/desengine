import { requireAccessOrRedirect } from "@/lib/auth/server"

import { ClientDemo } from "./ClientDemo"

export default async function Page() {
  await requireAccessOrRedirect("/playground/image-inspector")

  return (
    <main className="px-10 py-10">
      <h1 className="mb-4 text-xl font-semibold">Konva Image Inspector</h1>
      <ClientDemo />
    </main>
  )
}

