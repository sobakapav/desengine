const markdownBlockClassName = "space-y-2 text-sm leading-6 text-muted-foreground px-10"

const markdownElementClassNames = {
  paragraph: "whitespace-pre-wrap !text-lg",
  list: "list-disc space-y-1 pl-5 px-10 text-lg",
  orderedList: "list-decimal space-y-1 pl-5 px-10 text-lg",
  listItem: "pl-1 text-lg",
  heading1: "font-semibold text-foreground text-4xl leading-tight mt-10 mb-4",
  heading2: "font-semibold text-foreground text-3xl leading-tight mt-8 mb-3",
  heading3: "font-semibold text-foreground text-2xl leading-snug mt-6 mb-2",
  link: "text-foreground underline underline-offset-4 text-lg",
  image: "my-4 h-auto max-w-full rounded-md border border-border bg-background shadow-sm",
  inlineCode: "rounded bg-muted px-1.5 py-0.5 font-mono  text-xl text-foreground",
  codeBlock: "overflow-x-auto rounded-md bg-muted p-3 font-mono text-xl text-foreground",
  blockquote: "border-l-2 border-border pl-4 italic text-foreground/80 text-xl",
  mermaidBlock: "my-4 overflow-x-auto rounded-md bg-white p-4",
} as const

export { markdownBlockClassName, markdownElementClassNames }
