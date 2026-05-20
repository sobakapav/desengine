import rootPackageJson from "../../package.json"

export type SandpackUiKitId = "shadcn" | "ant" | "mui" | "none"

type SandpackUiKitConfig = {
  id: SandpackUiKitId
  title: string
  dependencies: Record<string, string>
  /**
   * Дополнительные импорты, которые нужно добавить в `/index.tsx` виртуального проекта.
   * Используется, например, для подключения глобального CSS UI kit'а.
   */
  indexTsxImports?: string[]
}

const DEFAULT_SANDPACK_UI_KIT_ID: SandpackUiKitId = "shadcn"

function getRootDependencyVersion(name: string) {
  const deps = (rootPackageJson as { dependencies?: Record<string, string> }).dependencies ?? {}
  const version = deps[name]

  if (!version) {
    throw new Error(
      `В корневом package.json не задана зависимость '${name}', но она нужна Sandpack UI kit'ам`,
    )
  }

  return version
}

const sandpackUiKitsConfig: Record<SandpackUiKitId, SandpackUiKitConfig> = {
  none: {
    id: "none",
    title: "Только React",
    dependencies: {},
  },
  shadcn: {
    id: "shadcn",
    title: "shadcn/ui",
    dependencies: {
      "@radix-ui/react-accordion": getRootDependencyVersion("@radix-ui/react-accordion"),
      "@radix-ui/react-alert-dialog": getRootDependencyVersion("@radix-ui/react-alert-dialog"),
      "@radix-ui/react-avatar": getRootDependencyVersion("@radix-ui/react-avatar"),
      "@radix-ui/react-checkbox": getRootDependencyVersion("@radix-ui/react-checkbox"),
      "@radix-ui/react-collapsible": getRootDependencyVersion("@radix-ui/react-collapsible"),
      "@radix-ui/react-context-menu": getRootDependencyVersion("@radix-ui/react-context-menu"),
      "@radix-ui/react-dialog": getRootDependencyVersion("@radix-ui/react-dialog"),
      "@radix-ui/react-dropdown-menu": getRootDependencyVersion("@radix-ui/react-dropdown-menu"),
      "@radix-ui/react-hover-card": getRootDependencyVersion("@radix-ui/react-hover-card"),
      "@radix-ui/react-label": getRootDependencyVersion("@radix-ui/react-label"),
      "@radix-ui/react-menubar": getRootDependencyVersion("@radix-ui/react-menubar"),
      "@radix-ui/react-navigation-menu": getRootDependencyVersion("@radix-ui/react-navigation-menu"),
      "@radix-ui/react-popover": getRootDependencyVersion("@radix-ui/react-popover"),
      "@radix-ui/react-progress": getRootDependencyVersion("@radix-ui/react-progress"),
      "@radix-ui/react-radio-group": getRootDependencyVersion("@radix-ui/react-radio-group"),
      "@radix-ui/react-scroll-area": getRootDependencyVersion("@radix-ui/react-scroll-area"),
      "@radix-ui/react-select": getRootDependencyVersion("@radix-ui/react-select"),
      "@radix-ui/react-separator": getRootDependencyVersion("@radix-ui/react-separator"),
      "@radix-ui/react-slider": getRootDependencyVersion("@radix-ui/react-slider"),
      "@radix-ui/react-slot": getRootDependencyVersion("@radix-ui/react-slot"),
      "@radix-ui/react-switch": getRootDependencyVersion("@radix-ui/react-switch"),
      "@radix-ui/react-tabs": getRootDependencyVersion("@radix-ui/react-tabs"),
      "@radix-ui/react-tooltip": getRootDependencyVersion("@radix-ui/react-tooltip"),
      "class-variance-authority": getRootDependencyVersion("class-variance-authority"),
      clsx: getRootDependencyVersion("clsx"),
      "lucide-react": getRootDependencyVersion("lucide-react"),
      "tailwind-merge": getRootDependencyVersion("tailwind-merge"),
    },
  },
  ant: {
    id: "ant",
    title: "Ant Design",
    dependencies: {
      antd: getRootDependencyVersion("antd"),
      "@ant-design/icons": getRootDependencyVersion("@ant-design/icons"),
    },
    indexTsxImports: ['import "antd/dist/reset.css";'],
  },
  mui: {
    id: "mui",
    title: "Material UI",
    dependencies: {
      "@mui/material": getRootDependencyVersion("@mui/material"),
      "@mui/icons-material": getRootDependencyVersion("@mui/icons-material"),
      "@emotion/react": getRootDependencyVersion("@emotion/react"),
      "@emotion/styled": getRootDependencyVersion("@emotion/styled"),
    },
  },
}

function normalizeSandpackUiKitId(rawUiKitId?: string | null): SandpackUiKitId {
  const raw = rawUiKitId?.trim().toLowerCase()
  if (!raw) return DEFAULT_SANDPACK_UI_KIT_ID

  if (raw === "none" || raw === "off" || raw === "false" || raw === "0") return "none"
  if (raw === "shadcn") return "shadcn"
  if (raw === "ant" || raw === "antd" || raw === "ant-design") return "ant"
  if (raw === "mui" || raw === "material" || raw === "material-ui") return "mui"

  return DEFAULT_SANDPACK_UI_KIT_ID
}

function validateSandpackUiKitsConfig() {
  const values = Object.values(sandpackUiKitsConfig)
  const ids = values.map((it) => it.id)
  const uniqueIds = new Set(ids)

  if (ids.length !== uniqueIds.size) {
    throw new Error("Некорректный конфиг Sandpack UI kit'ов: повторяющиеся id")
  }

  for (const kit of values) {
    if (!kit.id.trim()) {
      throw new Error("Некорректный конфиг Sandpack UI kit'ов: пустой id")
    }
    if (!kit.title.trim()) {
      throw new Error(`Некорректный конфиг Sandpack UI kit'ов: kit '${kit.id}' без title`)
    }
  }
}

export {
  DEFAULT_SANDPACK_UI_KIT_ID,
  normalizeSandpackUiKitId,
  sandpackUiKitsConfig,
  validateSandpackUiKitsConfig,
  type SandpackUiKitConfig,
}
