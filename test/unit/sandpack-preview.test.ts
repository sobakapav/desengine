// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Preview принимает UI-импорты из components/ui"
// @openSpec  - "По умолчанию включён shadcn/ui"
// @openSpec  - "Пользователь отключает UI kit"
// @openSpec  - "Пользователь включает Ant Design"
// @openSpec  - "Пользователь включает Material UI"
// @openSpec capability: ui-foundation
// @openSpec scenarios:
// @openSpec  - "Команда работает с динамическим render-островком"

import { describe, expect, it } from "vitest"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"
import {
  normalizeSandpackUiKitId,
  validateSandpackUiKitsConfig,
} from "../../lib/lab/sandpack-ui-kits.config"

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
  it("нормализует SANDPACK_UI_KIT и по умолчанию включает shadcn", () => {
    expect(normalizeSandpackUiKitId(undefined)).toBe("shadcn")
    expect(normalizeSandpackUiKitId("")).toBe("shadcn")
    expect(normalizeSandpackUiKitId("ant")).toBe("ant")
    expect(normalizeSandpackUiKitId("antd")).toBe("ant")
    expect(normalizeSandpackUiKitId("mui")).toBe("mui")
    expect(normalizeSandpackUiKitId("none")).toBe("none")
    expect(normalizeSandpackUiKitId("off")).toBe("none")
    expect(normalizeSandpackUiKitId("что-то-непонятное")).toBe("shadcn")
  })

  it("держит внешний конфиг UI kit'ов валидным", () => {
    expect(() => validateSandpackUiKitsConfig()).not.toThrow()
  })

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

  it("умеет выключать shadcn/ui через uiKitId=none", () => {
    const payload = buildSandpackPreviewPayload(
      {
        component: `export default function Component() {
  return <div>Preview</div>;
}
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      { uiKitId: "none" },
    )

    expect(payload.customSetup.dependencies).not.toMatchObject({
      "@radix-ui/react-dialog": expect.any(String),
    })
    expect(payload.files["/components/ui/badge.tsx"]).toBeUndefined()
  })

  it("подключает Ant Design через адаптер (antd + reset.css)", () => {
    const payload = buildSandpackPreviewPayload(
      {
        component: `import { Button } from "antd";

export default function Component() {
  return <Button type="primary">Кнопка</Button>;
}
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      { uiKitId: "ant" },
    )

    expect(payload.customSetup.dependencies).toMatchObject({
      antd: expect.any(String),
    })
    expect(payload.files["/index.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('import "antd/dist/reset.css";'),
    }))
    expect(payload.files["/components/ui/badge.tsx"]).toBeUndefined()
  })

  it("подключает Material UI через адаптер (@mui/material + emotion)", () => {
    const payload = buildSandpackPreviewPayload(
      {
        component: `import { Button } from "@mui/material";

export default function Component() {
  return <Button variant="contained">Кнопка</Button>;
}
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      { uiKitId: "mui" },
    )

    expect(payload.customSetup.dependencies).toMatchObject({
      "@mui/material": expect.any(String),
      "@emotion/react": expect.any(String),
      "@emotion/styled": expect.any(String),
    })
    expect(payload.files["/components/ui/badge.tsx"]).toBeUndefined()
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

    expect(payload.files["/level-template-runtime.ts"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("export const levelRuntime"),
    }))
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
