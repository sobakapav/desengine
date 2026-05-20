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
  it("payload для ant включает полный набор прямых runtime-зависимостей antd", () => {
    const antdDependencies = readInstalledAntdDependencies()
    const payload = buildSandpackPreviewPayload(
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

  it("payload для mui включает прямые runtime-зависимости @mui/material", () => {
    const muiDependencies = readInstalledPackageDependencies("@mui/material")
    const payload = buildSandpackPreviewPayload(
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

  it("payload по умолчанию для shadcn включает runtime-зависимости Radix", () => {
    const radixDialogDependencies = readInstalledPackageDependencies("@radix-ui/react-dialog")
    const payload = buildSandpackPreviewPayload({
      component: "export default function Component() { return <div>ok</div> }\n",
      uiBadge: "export function Badge() { return null }\n",
      systemUtils: "export function cn() { return \"\" }\n",
    })
    const resolvedDependencies = payload.customSetup.dependencies

    expect(resolvedDependencies["@radix-ui/react-dialog"]).toBeTruthy()

    for (const dependencyName of Object.keys(radixDialogDependencies)) {
      expect(resolvedDependencies[dependencyName]).toBeTruthy()
    }
  })
})
