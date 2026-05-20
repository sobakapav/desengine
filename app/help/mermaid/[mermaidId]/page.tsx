import Link from "next/link"
import { redirect } from "next/navigation"

import { MermaidDiagram } from "@/components/desengine/system/MermaidDiagram"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { readHelpMermaidSource } from "@/lib/help/content"
import { getHelpErrorUrl, getHelpRootUrl } from "@/lib/help/navigation"

type HelpMermaidPageProps = {
  params: Promise<{
    mermaidId: string
  }>
}

/**
 * @example
 * ```tsx
 * <HelpMermaidPage params={Promise.resolve({ mermaidId: "flow" })} />
 * ```
 */
export default async function HelpMermaidPage({ params }: HelpMermaidPageProps) {
  const { mermaidId } = await params
  await requireAccessOrRedirect(`/help/mermaid/${mermaidId}`)

  const diagram = await readHelpMermaidSource(mermaidId)

  if (!diagram) {
    redirect(getHelpErrorUrl())
  }

  return (
    <main className="tool-shell-page">
      <div className="tool-shell-frame">
        <section className="tool-shell-surface">
          <div className="mb-6 border-b border-black/10 pb-5">
            <Link className="tool-link-inline" href={getHelpRootUrl()}>
              Справка
            </Link>
            <h1 className="tool-page-title mt-3">{diagram.title}</h1>
          </div>

          <MermaidDiagram chart={diagram.content} className="overflow-auto rounded-lg border border-black/10 bg-white p-4" />
        </section>
      </div>
    </main>
  )
}
