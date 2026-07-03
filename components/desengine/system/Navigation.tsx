"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { getProjectsRootUrl } from "@/lib/project/navigation"
import { getSystemUrl } from "@/lib/system/navigation"
import { getHelpRootUrl } from "@/lib/help/navigation"

const navigationLinks = [
  { href: "/", label: "desengine" },
  { href: getProjectsRootUrl(), label: "проекты" },
  { href: getSystemUrl(), label: "система" },
  { href: getHelpRootUrl(), label: "справка" },
] as const

const contactLinks = [
  {
    href: "https://t.me/+ZN5GnB2Pd5Q2OWFi",
    label: "tg-группа общения",
    external: true,
  },
  {
    href: "https://t.me/eduhund_bot",
    label: "tg-полубот помощи",
    external: true,
  },
  {
    href: "mailto:edu@eduhund.com",
    label: "edu@eduhund.com",
    external: false,
  },
] as const

function Navigation() {
  const pathname = usePathname()

  return (
    <nav aria-label="Глобальная навигация продукта" className="shell-page pt-4 pb-0 px-6">
      <div className="shell-section flex flex-col gap-5 border border-black bg-white p-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Desengine shell</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
          {navigationLinks.map((item) => (
            <Link
              key={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={pathname === item.href
                ? "shell-tab-active inline-flex items-center justify-center border border-black bg-black px-4 py-3 text-center text-white no-underline"
                : "shell-tab inline-flex items-center justify-center border border-black bg-white px-4 py-3 text-center no-underline"}
              href={item.href}>
              {item.label}
            </Link> 
          ))}
        </div>
        </div>

        <div className="min-w-0 md:max-w-md">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Контакты</p>
          <div className="mt-4 grid gap-3">
          {contactLinks.map((item) => (
            <Link
              key={item.href}
              className="shell-tab inline-flex border border-black bg-white px-4 py-3 no-underline"
              href={item.href}
              rel={item.external ? "noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              {item.label}
            </Link>
          ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navigation }
