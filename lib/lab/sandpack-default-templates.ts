import fs from "node:fs"
import path from "node:path"

import { fallbackAppTsx } from "@/lib/lab/sandpack-template-fallback"

export type SandpackDefaultTemplates = {
  indexHtml: string
  indexTsxTemplate: string
  tsconfigJson: unknown
  tailwindConfigJs: string
  postcssConfigJs: string
  previewCssSource: string
  packageJson: Record<string, unknown>
  appTsx: string
}

const fallbackIndexHtml = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>desengine preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

const fallbackIndexTsxTemplate = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* __EXTRA_IMPORTS__ */

import "./styles.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Preview root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`

const fallbackTailwindConfigJs = `
module.exports = {
  content: ["./**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
`

const fallbackPostcssConfigJs = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`

const fallbackPreviewCssSource = `
:root {
  --background: #ffffff;
  --foreground: #111318;
  --border: #e2e5ea;
  --primary: #111318;
  --primary-foreground: #ffffff;
  --secondary: #f4f6f8;
  --secondary-foreground: #111318;
  --muted: #f4f6f8;
  --muted-foreground: #5f6672;
  --destructive: #dc2626;
  --radius: 0.375rem;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  border-color: var(--border);
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  font-family: "Segoe UI", "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background: transparent;
  color: var(--foreground);
}

.desengine-preview-root {
  min-height: 8rem;
  padding: 0;
}

.inline-flex { display: inline-flex; }
.flex { display: flex; }
.grid { display: grid; }
.hidden { display: none; }
.h-5 { height: 1.25rem; }
.w-fit { width: fit-content; }
.shrink-0 { flex-shrink: 0; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.gap-1 { gap: 0.25rem; }
.overflow-hidden { overflow: hidden; }
.rounded-full { border-radius: 9999px; }
.border { border-width: 1px; border-style: solid; }
.border-transparent { border-color: transparent; }
.border-border { border-color: var(--border); }
.bg-primary { background-color: var(--primary); }
.bg-secondary { background-color: var(--secondary); }
.bg-muted { background-color: var(--muted); }
[class~="bg-input/20"] { background-color: rgba(226, 229, 234, 0.2); }
[class~="bg-destructive/10"] { background-color: rgba(220, 38, 38, 0.1); }
.text-primary-foreground { color: var(--primary-foreground); }
.text-secondary-foreground { color: var(--secondary-foreground); }
.text-muted-foreground { color: var(--muted-foreground); }
.text-destructive { color: var(--destructive); }
.text-foreground { color: var(--foreground); }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
[class~="py-0.5"] { padding-top: 0.125rem; padding-bottom: 0.125rem; }
[class~="text-[0.625rem]"] { font-size: 0.625rem; }
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.font-medium { font-weight: 500; }
.whitespace-nowrap { white-space: nowrap; }
.transition-all { transition-property: all; transition-duration: 150ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
[class~="hover:bg-muted"]:hover { background-color: var(--muted); }
[class~="hover:text-muted-foreground"]:hover { color: var(--muted-foreground); }
`

const fallbackTsconfigJson = {
  compilerOptions: {
    target: "ESNext",
    useDefineForClassFields: true,
    lib: ["DOM", "DOM.Iterable", "ESNext"],
    allowJs: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    module: "ESNext",
    moduleResolution: "Node",
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: "react-jsx",
  },
  include: ["./**/*"],
}

const fallbackPackageJson: Record<string, unknown> = {
  main: "/index.tsx",
  dependencies: {},
}

const fallbackTemplates: SandpackDefaultTemplates = {
  indexHtml: fallbackIndexHtml,
  indexTsxTemplate: fallbackIndexTsxTemplate,
  tsconfigJson: fallbackTsconfigJson,
  tailwindConfigJs: fallbackTailwindConfigJs,
  postcssConfigJs: fallbackPostcssConfigJs,
  previewCssSource: fallbackPreviewCssSource,
  packageJson: fallbackPackageJson,
  appTsx: fallbackAppTsx,
}

function isErrnoException(error: unknown): error is { code?: string } {
  return typeof error === "object" && error !== null && "code" in error
}

function readTextFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT") return null
    throw error
  }
}

function readJsonFile(filePath: string): unknown | null {
  const text = readTextFile(filePath)
  if (text === null) return null
  return JSON.parse(text)
}

let cachedTemplates: SandpackDefaultTemplates | null = null
let didWarnMissingTemplatesInProd = false

/**
 * @example
 * ```ts
 * const templates = loadSandpackDefaultTemplates({ rootDir: process.cwd() })
 * ```
 */
export function loadSandpackDefaultTemplates(
  options: { rootDir?: string } = {},
): SandpackDefaultTemplates {
  const rootDir = options.rootDir ?? process.cwd()
  const shouldCache = process.env.NODE_ENV === "production"

  if (shouldCache && cachedTemplates) return cachedTemplates

  const templatesDir = path.join(rootDir, "lib", "lab", "sandpack-templates", "default")

  const indexHtml = readTextFile(path.join(templatesDir, "public", "index.html"))
  const indexTsxTemplate = readTextFile(path.join(templatesDir, "index.tsx"))
  const tsconfigJson = readJsonFile(path.join(templatesDir, "tsconfig.json"))
  const tailwindConfigJs = readTextFile(path.join(templatesDir, "tailwind.config.js"))
  const postcssConfigJs = readTextFile(path.join(templatesDir, "postcss.config.js"))
  const previewCssSource = readTextFile(path.join(templatesDir, "styles.css"))
  const packageJson = readJsonFile(path.join(templatesDir, "package.json"))
  const appTsx = readTextFile(path.join(templatesDir, "App.tsx"))

  const hasAllRequired = Boolean(
    indexHtml
    && indexTsxTemplate
    && tsconfigJson
    && tailwindConfigJs
    && postcssConfigJs
    && previewCssSource
    && packageJson
  )

  if (!hasAllRequired) {
    if (process.env.NODE_ENV === "production" && !didWarnMissingTemplatesInProd) {
      didWarnMissingTemplatesInProd = true
      console.error(
        "[sandpack] Не удалось загрузить шаблоны Sandpack preview с диска, используется встроенный fallback.",
      )
    }
  }

  const result: SandpackDefaultTemplates = {
    indexHtml: indexHtml ?? fallbackTemplates.indexHtml,
    indexTsxTemplate: indexTsxTemplate ?? fallbackTemplates.indexTsxTemplate,
    tsconfigJson: tsconfigJson ?? fallbackTemplates.tsconfigJson,
    tailwindConfigJs: tailwindConfigJs ?? fallbackTemplates.tailwindConfigJs,
    postcssConfigJs: postcssConfigJs ?? fallbackTemplates.postcssConfigJs,
    previewCssSource: previewCssSource ?? fallbackTemplates.previewCssSource,
    packageJson: (packageJson && typeof packageJson === "object" && packageJson !== null
      ? packageJson as Record<string, unknown>
      : fallbackTemplates.packageJson),
    appTsx: appTsx ?? fallbackTemplates.appTsx,
  }

  if (shouldCache) cachedTemplates = result
  return result
}
