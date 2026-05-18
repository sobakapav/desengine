type SandpackFileEntry = string | {
  code: string
  hidden?: boolean
  readOnly?: boolean
}

function toHiddenFiles(
  files: Record<string, string>,
  relativeRoot: string,
): SandpackPreviewFiles {
  return Object.fromEntries(
    Object.entries(files).map(([filePath, code]) => [
      filePath,
      hidden(rewriteRootAliasImports(code, relativeRoot)),
    ]),
  )
}

type SandpackPreviewFiles = Record<string, SandpackFileEntry>

type SandpackPreviewSourceFiles = {
  component: string
  stories?: string
  styles?: string
  mock?: string
  props?: string
  uiBadge: string
  systemUtils: string
  previewCss?: string
  shadcnFiles: Record<string, string>
}

type SandpackPreviewPayload = {
  files: SandpackPreviewFiles
  customSetup: {
    dependencies: Record<string, string>
    entry: string
    environment: "create-react-app"
  }
  options: {
    activeFile: string
    visibleFiles: string[]
    externalResources: string[]
  }
}

const defaultStylesSource = "export const styles = {};\n"
const defaultMockSource = "export const mock = {};\n"
const defaultPropsSource = "export {};\n"

const packageJson = {
  main: "/index.tsx",
  dependencies: {
    "@radix-ui/react-slot": "^1.2.4",
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "latest",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-scripts": "^5.0.1",
    "tailwind-merge": "^3.5.0",
    "typescript": "^5.0.0",
  },
}

const tsconfigJson = {
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

const indexHtml = `<!DOCTYPE html>
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

const tailwindConfigJs = `
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

const postcssConfigJs = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`

const previewCssSource = `
:root {
  --background: #ffffff;
  --foreground: #111318;
  --card: #ffffff;
  --card-foreground: #111318;
  --popover: #ffffff;
  --popover-foreground: #111318;
  --primary: #111318;
  --primary-foreground: #ffffff;
  --secondary: #f4f6f8;
  --secondary-foreground: #111318;
  --muted: #f4f6f8;
  --muted-foreground: #5f6672;
  --accent: #f4f6f8;
  --accent-foreground: #111318;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #e2e5ea;
  --input: #e2e5ea;
  --ring: #111318;
  --radius: 0.375rem;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  background: transparent;
  color: var(--foreground);
}

.desengine-preview-root {
  min-height: 100vh;
}
`

const mainTsx = `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

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

const appTsx = `import React from "react";

import Component from "./Component";
import * as mockModule from "./mock";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickPreviewProps(): Record<string, unknown> {
  const explicit = (mockModule as { mockProps?: unknown; mock?: unknown }).mockProps ?? (mockModule as { mock?: unknown }).mock;

  if (isPlainObject(explicit)) {
    return explicit;
  }

  return {};
}

export default function App() {
  return (
    <main className="desengine-preview-root">
      <Component {...pickPreviewProps()} />
    </main>
  );
}
`

// const previewCssSource = `
// :root {
//   --background: #ffffff;
//   --foreground: #111318;
//   --border: #e2e5ea;
//   --primary: #111318;
//   --primary-foreground: #ffffff;
//   --secondary: #f4f6f8;
//   --secondary-foreground: #111318;
//   --muted: #f4f6f8;
//   --muted-foreground: #5f6672;
//   --destructive: #dc2626;
//   --radius: 0.375rem;
// }

// *,
// *::before,
// *::after {
//   box-sizing: border-box;
//   border-color: var(--border);
// }

// html,
// body,
// #root {
//   min-height: 100%;
//   margin: 0;
// }

// body {
//   font-family: "Segoe UI", "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   text-rendering: optimizeLegibility;
//   background: transparent;
//   color: var(--foreground);
// }

// .desengine-preview-root {
//   min-height: 8rem;
//   padding: 0;
// }

// .inline-flex { display: inline-flex; }
// .flex { display: flex; }
// .grid { display: grid; }
// .hidden { display: none; }
// .h-5 { height: 1.25rem; }
// .w-fit { width: fit-content; }
// .shrink-0 { flex-shrink: 0; }
// .items-center { align-items: center; }
// .justify-center { justify-content: center; }
// .gap-1 { gap: 0.25rem; }
// .overflow-hidden { overflow: hidden; }
// .rounded-full { border-radius: 9999px; }
// .border { border-width: 1px; border-style: solid; }
// .border-transparent { border-color: transparent; }
// .border-border { border-color: var(--border); }
// .bg-primary { background-color: var(--primary); }
// .bg-secondary { background-color: var(--secondary); }
// .bg-muted { background-color: var(--muted); }
// [class~="bg-input/20"] { background-color: rgba(226, 229, 234, 0.2); }
// [class~="bg-destructive/10"] { background-color: rgba(220, 38, 38, 0.1); }
// .text-primary-foreground { color: var(--primary-foreground); }
// .text-secondary-foreground { color: var(--secondary-foreground); }
// .text-muted-foreground { color: var(--muted-foreground); }
// .text-destructive { color: var(--destructive); }
// .text-foreground { color: var(--foreground); }
// .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
// [class~="py-0.5"] { padding-top: 0.125rem; padding-bottom: 0.125rem; }
// [class~="text-[0.625rem]"] { font-size: 0.625rem; }
// .text-xs { font-size: 0.75rem; line-height: 1rem; }
// .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
// .font-medium { font-weight: 500; }
// .whitespace-nowrap { white-space: nowrap; }
// .transition-all { transition-property: all; transition-duration: 150ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
// [class~="hover:bg-muted"]:hover { background-color: var(--muted); }
// [class~="hover:text-muted-foreground"]:hover { color: var(--muted-foreground); }
// `

function hidden(code: string): SandpackFileEntry {
  return {
    code,
    hidden: true,
    readOnly: true,
  }
}

function rewriteRootAliasImports(code: string, relativeRoot: string) {
  return code
    .replaceAll("from \"@/", `from "${relativeRoot}`)
    .replaceAll("from '@/", `from '${relativeRoot}`)
    .replaceAll("import(\"@/", `import("${relativeRoot}`)
    .replaceAll("import('@/", `import('${relativeRoot}`)
}

function buildSandpackPreviewPayload(sourceFiles: SandpackPreviewSourceFiles): SandpackPreviewPayload {
  const files: SandpackPreviewFiles = {
    "/public/index.html": hidden(indexHtml),
    "/package.json": hidden(JSON.stringify(packageJson, null, 2)),
    "/tsconfig.json": hidden(JSON.stringify(tsconfigJson, null, 2)),
    "/index.tsx": hidden(mainTsx),
    "/App.tsx": hidden(appTsx),
    "/Component.tsx": {
      code: rewriteRootAliasImports(sourceFiles.component, "./"),
      readOnly: true,
    },
    "/Component.stories.ts": hidden(sourceFiles.stories ?? ""),
    "/styles.ts": hidden(sourceFiles.styles ?? defaultStylesSource),
    "/mock.ts": hidden(sourceFiles.mock ?? defaultMockSource),
    "/props.ts": hidden(sourceFiles.props ?? defaultPropsSource),
    "/styles.css": hidden(sourceFiles.previewCss ?? previewCssSource),
    ...toHiddenFiles(sourceFiles.shadcnFiles, "../../"),
    "/lib/system/utils.ts": hidden(sourceFiles.systemUtils),
    "/lib/utils.ts": hidden(`
      import { clsx, type ClassValue } from "clsx"
      import { twMerge } from "tailwind-merge"
      export function cn(...inputs: ClassValue[]) {
        return twMerge(clsx(inputs))
      }
      `),
    "/tailwind.config.js": hidden(tailwindConfigJs),
    "/postcss.config.js": hidden(postcssConfigJs),
  }

  return {
    files,
    customSetup: {
      dependencies: packageJson.dependencies,
      entry: "/index.tsx",
      environment: "create-react-app",
    },
    options: {
      activeFile: "/Component.tsx",
      visibleFiles: ["/Component.tsx"],
      externalResources: ["https://cdn.tailwindcss.com"],
    },
  }
}

export {
  buildSandpackPreviewPayload,
  type SandpackFileEntry,
  type SandpackPreviewFiles,
  type SandpackPreviewPayload,
  type SandpackPreviewSourceFiles,
}
