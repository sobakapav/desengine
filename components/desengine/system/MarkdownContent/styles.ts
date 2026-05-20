const markdownBlockClassName = "space-y-3 text-sm leading-6 text-muted-foreground px-10"

const markdownElementClassNames = {
  paragraph: "whitespace-pre-wrap text-xl",
  list: "list-disc space-y-1 pl-5 text-xl px-10",
  orderedList: "list-decimal space-y-1 pl-5 text-xl px-10",
  listItem: "pl-1 text-xl px-10",
  heading: "font-semibold text-foreground text-4xl leading-tight mt-4 mb-2",
  link: "text-foreground underline underline-offset-4 text-xl",
  image: "my-4 h-auto max-w-full rounded-md border border-border bg-background shadow-sm",
  inlineCode: "rounded bg-muted px-1.5 py-0.5 font-mono  text-xl text-foreground",
  codeBlock: "overflow-x-auto rounded-md bg-muted p-3 font-mono text-xl text-foreground",
  blockquote: "border-l-2 border-border pl-4 italic text-foreground/80 text-xl",
  mermaidBlock: "my-4 overflow-x-auto rounded-md bg-white p-4",
} as const

export { markdownBlockClassName, markdownElementClassNames }
