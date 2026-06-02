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
// @openSpec  - "Preview применяет Tailwind arbitrary values и ширину компонента"
// @openSpec  - "Preview фиксирует exact installed версии runtime-зависимостей"
// @openSpec capability: ui-foundation
// @openSpec scenarios:
// @openSpec  - "Команда работает с динамическим render-островком"

import { describe, expect, it } from "vitest"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"
import { readInstalledPackageVersion } from "../../lib/lab/sandpack-runtime-dependencies"
import {
  normalizeSandpackUiKitId,
  validateSandpackUiKitsConfig,
} from "../../lib/lab/sandpack-ui-kits.config"
import {
  badgeSource,
  readLevelAppTemplate,
  readRepositoryShadcnSourceFiles,
  utilsSource,
} from "./sandpack-preview.helpers"

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

  it("возвращает исключённые shadcn-компоненты в Sandpack dependency graph", async () => {
    const repositorySources = await readRepositoryShadcnSourceFiles()
    const payload = await buildSandpackPreviewPayload({
      component: `import * as UI from "@/components/ui";

export default function Component() {
  return <div>{Object.keys(UI).join(",")}</div>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
      ...repositorySources,
    })

    expect(payload.files["/src/components/ui/index.ts"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('export * from "./alert-dialog"'),
    }))
    expect(payload.files["/src/components/ui/index.ts"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('export * from "./sidebar"'),
    }))
    expect(payload.files["/src/hooks/use-mobile.ts"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("useIsMobile"),
    }))
    expect(payload.files["/src/components/ui/sidebar-context.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "../../hooks/use-mobile"'),
    }))
    expect(payload.customSetup.dependencies).toMatchObject({
      "@base-ui/react": expect.any(String),
      "@radix-ui/react-alert-dialog": expect.any(String),
      "@radix-ui/react-slot": expect.any(String),
      "input-otp": expect.any(String),
      "next-themes": expect.any(String),
      "react-resizable-panels": expect.any(String),
      recharts: expect.any(String),
      sonner: expect.any(String),
      vaul: expect.any(String),
    })
  })

  it("фиксирует exact installed версии для shadcn runtime-зависимостей", async () => {
    const repositorySources = await readRepositoryShadcnSourceFiles()
    const payload = await buildSandpackPreviewPayload({
      component: `import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Component() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Открыть</AlertDialogTrigger>
      <AlertDialogContent>ok</AlertDialogContent>
    </AlertDialog>
  );
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
      ...repositorySources,
    })

    expect(payload.customSetup.dependencies["@radix-ui/react-alert-dialog"]).toBe(
      readInstalledPackageVersion("@radix-ui/react-alert-dialog"),
    )
    expect(payload.customSetup.dependencies["@radix-ui/react-slot"]).toBe(
      readInstalledPackageVersion("@radix-ui/react-slot"),
    )
    expect(payload.customSetup.dependencies.react).toBe(
      readInstalledPackageVersion("react"),
    )
    expect(payload.customSetup.dependencies["react-dom"]).toBe(
      readInstalledPackageVersion("react-dom"),
    )
  })

  it("собирает preview-проект с настоящим Badge вместо HTML-заглушки", async () => {
    const payload = await buildSandpackPreviewPayload({
      component: `import { Badge } from "@/components/ui/badge";

export default function Component() {
  return <Badge variant="ghost">Четверг</Badge>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    })

    expect(payload.files["/src/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('variant="ghost"'),
    }))
    expect(payload.files["/src/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "./components/ui/badge"'),
    }))
    expect(payload.files["/src/components/ui/badge.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("badgeVariants({ variant })"),
    }))
    expect(payload.files["/src/components/ui/badge.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "../../lib/system/utils"'),
    }))
    expect(payload.files["/src/components/ui/badge.tsx"]).not.toEqual(expect.objectContaining({
      code: expect.stringContaining('React.createElement("span", props, children)'),
    }))
    expect(payload.files["/src/lib/system/utils.ts"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("twMerge(clsx(inputs))"),
    }))
  })

  it("умеет выключать shadcn/ui через uiKitId=none", async () => {
    const payload = await buildSandpackPreviewPayload(
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
    expect(payload.files["/src/components/ui/badge.tsx"]).toBeUndefined()
  })

  it("подключает Ant Design через адаптер (antd + reset.css)", async () => {
    const payload = await buildSandpackPreviewPayload(
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
    expect(payload.files["/src/index.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('import "antd/dist/reset.css";'),
    }))
    expect(payload.files["/node_modules/@rc-component/picker/locale/en_US.js"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('/node_modules/@rc-component/picker/es/locale/en_US.js'),
    }))
    expect(payload.files["/node_modules/@rc-component/picker/locale/en_US"]).toBeUndefined()
    expect(payload.files["/node_modules/@rc-component/picker/locale/en_US/index.js"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('/node_modules/@rc-component/picker/es/locale/en_US.js'),
    }))
    expect(payload.files["/node_modules/@rc-component/picker/locale/en_GB.js"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('/node_modules/@rc-component/picker/es/locale/en_GB.js'),
    }))
    expect(payload.files["/node_modules/@rc-component/picker/generate/dayjs.js"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('/node_modules/@rc-component/picker/es/generate/dayjs.js'),
    }))
    expect(payload.files["/node_modules/antd/es/date-picker/locale/en_US.js"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('/node_modules/@rc-component/picker/es/locale/en_US.js'),
    }))
    expect(payload.files["/src/components/ui/badge.tsx"]).toBeUndefined()
  })

  it("классифицирует shadcn-импорты как incompatibility для Ant Design проекта", async () => {
    const payload = await buildSandpackPreviewPayload(
      {
        component: `import { Tabs } from "@/components/ui/tabs";

export default function Component() {
  return <Tabs />;
}
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      { uiKitId: "ant", uiMode: "ui-kit" },
    )

    expect(payload.project.compatibility).toEqual({
      status: "incompatible",
      message: expect.stringContaining("не подключает imports из components/ui"),
    })
  })

  it("подключает Material UI через адаптер (@mui/material + emotion)", async () => {
    const payload = await buildSandpackPreviewPayload(
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
    expect(payload.files["/src/components/ui/badge.tsx"]).toBeUndefined()
  })

  it("подключает prebuilt preview CSS и client-bundler runtime к виртуальному проекту", async () => {
    const payload = await buildSandpackPreviewPayload({
      component: `export default function Component() {
  return <div className="bg-slate-100 px-2">Preview</div>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    })

    expect(payload.files["/src/level-template-runtime.ts"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("export const levelRuntime"),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining(".bg-slate-100"),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining(".w-\\[137px\\]"),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining(".h-\\[19px\\]"),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.not.stringContaining('@import "tailwindcss";'),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.not.stringContaining("@tailwind utilities;"),
    }))
    expect(payload.files["/postcss.config.js"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("@tailwindcss/postcss"),
    }))
    expect(payload.customSetup.environment).toBe("create-react-app")
    expect(payload.customSetup.entry).toBe("/src/index.tsx")
    expect(payload.files["/package.json"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('"main": "/src/index.tsx"'),
    }))
    expect(payload.customSetup.dependencies).toMatchObject({
      "@tailwindcss/postcss": expect.any(String),
      postcss: expect.any(String),
      tailwindcss: expect.any(String),
    })
    expect(payload.options.externalResources).toEqual([])
  })

  it("не тащит весь shadcn dependency graph, если компонент не импортирует ui-kit пакеты", async () => {
    const payload = await buildSandpackPreviewPayload({
      component: `export default function Component() {
  return <div className="w-[57px] h-[16px] bg-gray-200">Preview</div>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    })

    expect(payload.customSetup.dependencies).not.toHaveProperty("@radix-ui/react-dialog")
    expect(payload.customSetup.dependencies).not.toHaveProperty("lucide-react")
    expect(payload.customSetup.dependencies).not.toHaveProperty("class-variance-authority")
  })

  it("готовит preview к arbitrary Tailwind values и полной ширине компонента", async () => {
    const payload = await buildSandpackPreviewPayload({
      component: `export default function Component() {
  return (
    <section className="w-full">
      <div className="min-w-[220px] h-[16.6px] text-[11px] bg-[Canvas] text-[CanvasText]">
        Tailwind arbitrary values
      </div>
    </section>
  );
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    })
    expect(payload.files["/src/Component.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('className="w-full"'),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining(".min-w-\\[220px\\]"),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining(".bg-\\[Canvas\\]"),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining(".text-\\[CanvasText\\]"),
    }))
    expect(payload.files["/tailwind.config.js"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('content: ["./**/*.{js,jsx,ts,tsx}"]'),
    }))
  })

  it("встраивает runtime contract для диагностики styled preview", async () => {
    const payload = await buildSandpackPreviewPayload({
      component: `export default function Component() {
  return <div className="w-full h-24 bg-gray-100">Preview</div>;
}
`,
      uiBadge: badgeSource,
      systemUtils: utilsSource,
    }, {
      previewSessionId: "session-123",
    })

    expect(payload.files["/src/preview-runtime-contract.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("desengine-sandpack-preview"),
    }))
    expect(payload.files["/src/preview-runtime-contract.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('const PREVIEW_SESSION_ID = "session-123"'),
    }))
    expect(payload.files["/src/preview-runtime-contract.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("previewSessionId: PREVIEW_SESSION_ID"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("PreviewRuntimeContractBoundary"),
    }))
    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining('from "./preview-runtime-contract"'),
    }))
  })

  it("собирает preview payload с реальным level App template", async () => {
    const levelAppTemplate = await readLevelAppTemplate("level-1")

    const payload = await buildSandpackPreviewPayload(
      {
        component: `export default function Component() {
  return <div className="w-[57px] h-[16px] bg-gray-200 flex items-center justify-center">Preview</div>;
}
`,
        uiBadge: badgeSource,
        systemUtils: utilsSource,
      },
      {
        appTemplate: {
          appTsx: levelAppTemplate,
          previewCss: null,
          levelTemplateRuntime: 'export const levelRuntime = { levelId: "level-1" } as const;\n',
        },
      },
    )

    expect(payload.files["/src/App.tsx"]).toEqual(expect.objectContaining({
      code: expect.stringContaining("desengine-preview-root"),
    }))
    expect(payload.files["/src/styles.css"]).toEqual(expect.objectContaining({
      code: expect.stringContaining(".bg-gray-200"),
    }))
  })
})
