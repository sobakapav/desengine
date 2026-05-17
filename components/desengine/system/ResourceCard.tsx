import { Resource } from "@/lib/system/types"
import { BaseProps } from "./Base"
import { ResourceStateBullet } from "./ResourceStateBullet"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type ResourceCardProps = BaseProps & {
    resource: Resource,
}

function ResourceCard({
    resource
} : ResourceCardProps) {
    return (
        <div className="grid grid-cols-[max-content_1fr] w-full items-center gap-x-2 py-2">
            <ResourceStateBullet state={resource.state} className="flex-1"/>
            <div className="text-2xl">{resource.label}</div>

            <div />
            <ResourceMarkdown text={resource.summary} />

            <div />
            <ResourceMarkdown text={resource.detail} />
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
