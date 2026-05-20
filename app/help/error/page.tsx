import Link from "next/link"

import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getHelpRootUrl } from "@/lib/help/navigation"

export default async function HelpErrorPage() {
  await requireAccessOrRedirect("/help/error")

  return (
    <main>
      <div>
        <section>
          <div className="space-y-3">
            <div>desengine help</div>
            <h1>Страница справки недоступна</h1>
            <p>
              Не удалось открыть Markdown-страницу или связанный Mermaid-файл. Проверьте имя файла в каталоге help.
            </p>
            <Link href={getHelpRootUrl()}>
              Вернуться к справке
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

