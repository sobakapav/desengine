import Link from "next/link"

import { requireAccessOrRedirect } from "@/lib/auth/server"
import { listHelpPages } from "@/lib/help/content"

/**
 * @example
 * ```tsx
 * <HelpPage />
 * ```
 */
export default async function HelpPage() {
//  await requireAccessOrRedirect("/help")
  const helpPages = await listHelpPages()

  return (
    <main className="shell-page">
      <section className="shell-section">
      <div className="space-y-3 border-b border-black pb-5">
       <p className="shell-eyebrow">Help</p>
       <h1 className="shell-title text-foreground">
        Справка
        </h1>
      </div>

          {helpPages.length > 0 ? (
            <nav className="mt-6 grid gap-3" aria-label="Страницы справки">
              {helpPages.map((page) => (
                <Link key={page.id} className="shell-tab block" href={page.href}>
                  <span className="font-semibold text-black">{page.title}</span>
                </Link>
              ))}
            </nav>
          ) : (
            <p className="mt-6 text-black/65">В каталоге help пока нет Markdown-страниц.</p>
          )}
        </section>
    </main>
  )
}
