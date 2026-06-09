import fs from "node:fs"
import path from "node:path"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"

import { readLevelSandpackTemplate } from "../../lib/lab/sandpack-template"
import { readFilesRecursively } from "../../lib/system/shadcn-files"

const level5AppTemplateSource = `import React from "react";
import Component from "./Component";
import * as mockModule from "./mock";
import { PreviewRuntimeContractBoundary } from "./preview-runtime-contract";

function resolvePreviewProps() {
  const explicit = mockModule.mockProps ?? mockModule.mock;

  if (explicit && typeof explicit === "object" && !Array.isArray(explicit)) {
    return explicit;
  }

  return {};
}

export default function App() {
  const previewMock = mockModule.mock;
  const explicit = mockModule.mockProps ?? mockModule.mock;

  if (explicit && typeof explicit === "object" && !Array.isArray(explicit)) {
    return (
      <PreviewRuntimeContractBoundary>
        <Component {...explicit} />
      </PreviewRuntimeContractBoundary>
    );
  }

  if (Array.isArray(previewMock)) {
    return (
      <>
        {previewMock.map((item, index) => (
          <PreviewRuntimeContractBoundary key={index}>
            <Component key={index} {...item} />
          </PreviewRuntimeContractBoundary>
        ))}
      </>
    );
  }

  const previewProps = resolvePreviewProps();

  return (
    <PreviewRuntimeContractBoundary>
      <Component {...previewProps} />
    </PreviewRuntimeContractBoundary>
  );
}
`

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

async function readRepositoryShadcnSourceFiles() {
  const [shadcnFiles, useMobileHook] = await Promise.all([
    readFilesRecursively(path.join(process.cwd(), "components", "ui"), "/components/ui"),
    fs.promises.readFile(path.join(process.cwd(), "hooks", "use-mobile.ts"), "utf-8"),
  ])

  return {
    shadcnFiles,
    supportFiles: {
      "/hooks/use-mobile.ts": useMobileHook,
    },
  }
}

async function readLevel5AppTemplateOptions() {
  return {
    appTsx: level5AppTemplateSource,
    previewCss: null,
    levelTemplateRuntime: "export const levelRuntime = {} as const;\n",
  }
}

async function readLevelAppTemplate(levelId: string) {
  const template = await readLevelSandpackTemplate(levelId, { rootDir: process.cwd() })
  return template.appTsx
}

function readSandpackFileCode(file: string | { code: string }) {
  return typeof file === "string" ? file : file.code
}

function renderBuiltLevel5App(args: {
  appSource: string
  mockModule: Record<string, unknown>
}) {
  const compiled = ts.transpileModule(args.appSource, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
    },
  })
  const module = { exports: {} as { default?: React.ComponentType } }
  const previewComponent = ({ title }: { title?: string }) => React.createElement(
    "article",
    { "data-preview-component": "true" },
    title ?? "empty",
  )

  const localRequire = (specifier: string) => {
    if (specifier === "react") {
      return React
    }

    if (specifier === "./Component") {
      return { __esModule: true, default: previewComponent }
    }

    if (specifier === "./mock") {
      return args.mockModule
    }

    if (specifier === "./level-template-runtime") {
      return { levelRuntime: {} }
    }

    if (specifier === "./preview-runtime-contract") {
      return {
        PreviewRuntimeContractBoundary: ({ children }: { children: React.ReactNode }) => React.createElement(
          React.Fragment,
          null,
          children,
        ),
      }
    }

    throw new Error(`Неожиданный import в level-5 App template: ${specifier}`)
  }

  const executor = new Function("require", "module", "exports", compiled.outputText)
  executor(localRequire, module, module.exports)

  const App = module.exports.default
  if (!App) {
    throw new Error("Собранный level-5 App template не экспортирует default App")
  }

  return renderToStaticMarkup(React.createElement(App))
}

export {
  badgeSource,
  level5AppTemplateSource,
  readLevelAppTemplate,
  readLevel5AppTemplateOptions,
  readRepositoryShadcnSourceFiles,
  readSandpackFileCode,
  renderBuiltLevel5App,
  utilsSource,
}
