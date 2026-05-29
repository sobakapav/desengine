import { Resource } from "@/lib/system/types"
import { BaseProps } from "./Base"
import { ResourceStateBullet } from "./ResourceStateBullet"
import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type ResourceCardProps = BaseProps & {
    children?: ReactNode
    resource: Resource
}

function ResourceCard({
  children,
  resource
}: ResourceCardProps) {
  return (
    <div className="w-full py-3">
      <div className="flex items-center gap-2">
<div className="min-w-0 text-lg font-semibold leading-snug">
  {resource.label}
</div>

        <ResourceStateBullet state={resource.state} />
      </div>

<div className="mt-1 text-base font-medium leading-snug opacity-90">
  <ResourceMarkdown text={resource.summary} />
</div>

<div className="mt-1 text-base leading-snug opacity-60">
  <ResourceMarkdown text={resource.detail} />
</div>

      {children ? (
        <div className="mt-3 min-w-0">
          {children}
        </div>
      ) : null}
    </div>
  )
}

function ResourceMarkdown({ text }: { text: string }) {
  return (
    <span className="min-w-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        allowedElements={["a", "code", "em", "strong", "text"]}
        unwrapDisallowed
        components={{
          a: ({ href, children }) => (
            <a href={href} className="underline underline-offset-2">
              {children}
            </a>
          ),
          code: ({ children }) => <code>{children}</code>,
        }}
      >
        {text}
      </ReactMarkdown>
    </span>
  )
}

export {
  ResourceCard
}
