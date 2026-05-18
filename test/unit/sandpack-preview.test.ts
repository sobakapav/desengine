// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"
// @openSpec capability: ui-foundation
// @openSpec scenarios:
// @openSpec  - "Команда работает с динамическим render-островком"

import { describe, expect, it } from "vitest"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"

const badgeSource = `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/system/utils"

const badgeVariants = cva("inline-flex", {
  variants: {
    variant: {
      default: "bg-primary",
      ghost: "hover:bg-muted hover:text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Badge({ className, variant = "default", ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
`

const utilsSource = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`

describe("buildSandpackPreviewPayload", () => {
  it("собирает preview-проект с настоящим Badge вместо HTML-заглушки", () => {
    const payload = buildSandpackPreviewPayload({
      component: `import { Badge } from "@/components/ui/badge";

export default function Component() {
  return <Badge variant="ghost">Четверг</Badge>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    })

    expect(payload.files["/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('variant="ghost"'),
    }))
    expect(payload.files["/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "./components/ui/badge"'),
    }))
    expect(payload.files["/components/ui/badge.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("badgeVariants({ variant })"),
    }))
    expect(payload.files["/components/ui/badge.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "../../lib/system/utils"'),
    }))
    expect(payload.files["/components/ui/badge.tsx"]).not.toEqual(expect.objectContaining({
      code: expect.stringContaining('React.createElement("span", props, children)'),
    }))
    expect(payload.files["/lib/system/utils.ts"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("twMerge(clsx(inputs))"),
    }))
  })

  it("подключает Tailwind CSS и client-bundler runtime к виртуальному проекту", () => {
    const payload = buildSandpackPreviewPayload({
      component: `export default function Component() {
  return <div className="bg-slate-100 px-2">Preview</div>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    })

    expect(payload.files["/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('[class~="hover:bg-muted"]:hover'),
    }))
    expect(payload.customSetup.environment).toBe("create-react-app")
    expect(payload.customSetup.entry).toBe("/index.tsx")
    expect(payload.customSetup.dependencies).toMatchObject({
      "class-variance-authority": expect.any(String),
    })
  })

  it("передаёт в Sandpack готовый CSS для variant-классов Badge", () => {
    const payload = buildSandpackPreviewPayload({
      component: `import { Badge } from "@/components/ui/badge";

export default function Component() {
  return <Badge variant="ghost">Четверг</Badge>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    })
    const previewCss = payload.files["/styles.css"]

    expect(previewCss).toEqual(expect.objectContaining({
      code: expect.stringContaining('[class~="hover:text-muted-foreground"]:hover'),
    }))
    expect(previewCss).toEqual(expect.objectContaining({
      code: expect.stringContaining("--muted-foreground"),
    }))
  })
})
