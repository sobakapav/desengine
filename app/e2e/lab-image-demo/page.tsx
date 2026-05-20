import { Suspense } from "react"

import { ClientDemo } from "./ClientDemo"

export default function Page() {
  return (
    <main className="px-10 py-10">
      <h1 className="mb-4 text-xl font-semibold">E2E: Lab Image Demo</h1>
      <Suspense fallback={<p>Загрузка demo...</p>}>
        <ClientDemo />
      </Suspense>
    </main>
  )
}
