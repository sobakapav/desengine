// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "По умолчанию включён shadcn/ui"
// @openSpec  - "Пользователь включает Ant Design"
// @openSpec  - "Пользователь включает Material UI"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"

type NpmPackageJson = {
  dependencies?: Record<string, string>
}

function readInstalledAntdDependencies() {
  const antdPackageJsonPath = path.join(process.cwd(), "node_modules", "antd", "package.json")
  const raw = fs.readFileSync(antdPackageJsonPath, "utf8")
  const parsed = JSON.parse(raw) as NpmPackageJson
  return parsed.dependencies ?? {}
}

function readInstalledPackageDependencies(packageName: string) {
  const packageJsonPath = path.join(process.cwd(), "node_modules", packageName, "package.json")
  const raw = fs.readFileSync(packageJsonPath, "utf8")
  const parsed = JSON.parse(raw) as NpmPackageJson
  return parsed.dependencies ?? {}
}

describe("sandpack ant runtime dependencies", () => {
  it("payload для ant включает полный набор прямых runtime-зависимостей antd", async () => {
    const antdDependencies = readInstalledAntdDependencies()
    const payload = await buildSandpackPreviewPayload(
      {
        component: "export default function Component() { return null }\n",
        uiBadge: "export function Badge() { return null }\n",
        systemUtils: "export function cn() { return \"\" }\n",
      },
      { uiKitId: "ant" },
    )
    const resolvedDependencies = payload.customSetup.dependencies

    expect(resolvedDependencies.antd).toBeTruthy()

    for (const dependencyName of Object.keys(antdDependencies)) {
      expect(resolvedDependencies[dependencyName]).toBeTruthy()
    }
  })

  it("payload для mui включает прямые runtime-зависимости @mui/material", async () => {
    const muiDependencies = readInstalledPackageDependencies("@mui/material")
    const payload = await buildSandpackPreviewPayload(
      {
        component: "export default function Component() { return null }\n",
        uiBadge: "export function Badge() { return null }\n",
        systemUtils: "export function cn() { return \"\" }\n",
      },
      { uiKitId: "mui" },
    )
    const resolvedDependencies = payload.customSetup.dependencies

    expect(resolvedDependencies["@mui/material"]).toBeTruthy()

    for (const dependencyName of Object.keys(muiDependencies)) {
      expect(resolvedDependencies[dependencyName]).toBeTruthy()
    }
  })

  it("payload для shadcn-компонента с dialog включает runtime-зависимости Radix", async () => {
    const radixDialogDependencies = readInstalledPackageDependencies("@radix-ui/react-dialog")
    const payload = await buildSandpackPreviewPayload({
      component: `
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function Component() {
  return (
    <Dialog>
      <DialogTrigger>Открыть</DialogTrigger>
      <DialogContent>ok</DialogContent>
    </Dialog>
  )
}
`,
      uiBadge: "export function Badge() { return null }\n",
      systemUtils: "export function cn() { return \"\" }\n",
      shadcnFiles: {
        "components/ui/dialog.tsx": `
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

export function Dialog({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Root>{children}</DialogPrimitive.Root>
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Trigger>{children}</DialogPrimitive.Trigger>
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <DialogPrimitive.Content>{children}</DialogPrimitive.Content>
}
`,
      },
    })
    const resolvedDependencies = payload.customSetup.dependencies

    expect(resolvedDependencies["@radix-ui/react-dialog"]).toBeTruthy()

    for (const dependencyName of Object.keys(radixDialogDependencies)) {
      expect(resolvedDependencies[dependencyName]).toBeTruthy()
    }
  })
})
