import Link from "next/link"

import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getHelpRootUrl } from "@/lib/help/navigation"

export default async function HelpErrorPage() {
  await requireAccessOrRedirect("/help/error")

  return (
    <main className="tool-shell-page">
      <div className="tool-shell-frame">
        <section className="tool-shell-surface">
          <div className="space-y-3">
            <div className="tool-eyebrow">desengine help</div>
            <h1 className="tool-page-title">Страница справки недоступна</h1>
            <p className="tool-page-description">
              Не удалось открыть Markdown-страницу или связанный Mermaid-файл. Проверьте имя файла в каталоге help.
            </p>
            <Link className="tool-link-inline" href={getHelpRootUrl()}>
              Вернуться к справке
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

