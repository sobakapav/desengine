import Link from "next/link"
import { redirect } from "next/navigation"

import { MarkdownContent } from "@/components/desengine/system/MarkdownContent"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getHelpErrorUrl, getHelpRootUrl } from "@/lib/help/navigation"
import { readHelpMarkdownPage } from "@/lib/help/content"

type HelpMarkdownPageProps = {
  params: Promise<{
    helpId: string
  }>
}

/**
 * @example
 * ```tsx
 * <HelpMarkdownPage params={Promise.resolve({ helpId: "start" })} />
 * ```
 */
export default async function HelpMarkdownPage({ params }: HelpMarkdownPageProps) {
  const { helpId } = await params
  await requireAccessOrRedirect(`/help/${helpId}`)

  const page = await readHelpMarkdownPage(helpId)

  if (!page) {
    redirect(getHelpErrorUrl())
  }

  return (
    <main>
      <div>
        <section>
          <div className="mb-6 border-b border-black/10 pb-5">
            <Link href={getHelpRootUrl()}>
              Справка
            </Link>
            <h1 className="tool-page-title mt-3">{page.title}</h1>
          </div>

          <MarkdownContent content={page.content} assetBasePath={getHelpRootUrl()} />
        </section>
      </div>
    </main>
  )
}
