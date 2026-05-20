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
  await requireAccessOrRedirect("/help")
  const helpPages = await listHelpPages()

  return (
    <main className="tool-shell-page">
      <div className="tool-shell-frame">
        <section className="tool-shell-surface">
          <div className="space-y-3 border-b border-black/10 pb-5">
            <div className="tool-eyebrow">desengine help</div>
            <h1 className="tool-page-title">Справка</h1>
            <p className="tool-page-description">
              Markdown-страницы из каталога help. Заголовки берутся из первого H1 в каждом файле.
            </p>
          </div>

          {helpPages.length > 0 ? (
            <nav className="mt-6 grid gap-3" aria-label="Страницы справки">
              {helpPages.map((page) => (
                <Link key={page.id} className="tool-card block hover:border-black/25" href={page.href}>
                  <span className="font-semibold text-black">{page.title}</span>
                </Link>
              ))}
            </nav>
          ) : (
            <p className="mt-6 text-black/65">В каталоге help пока нет Markdown-страниц.</p>
          )}
        </section>
      </div>
    </main>
  )
}
