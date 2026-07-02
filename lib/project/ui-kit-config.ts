export type ProjectUiKitId = "shadcn" | "ant" | "mui" | "none"

type ProjectUiKitConfig = {
  id: ProjectUiKitId
  title: string
  dependencies: Record<string, string>
  indexTsxImports?: string[]
}

const DEFAULT_PROJECT_UI_KIT_ID: ProjectUiKitId = "shadcn"

function mapDependencyNames(names: string[]) {
  return Object.fromEntries(names.map((name) => [name, "*"]))
}

const projectUiKitsConfig: Record<ProjectUiKitId, ProjectUiKitConfig> = {
  none: {
    id: "none",
    title: "Только React",
    dependencies: {},
  },
  shadcn: {
    id: "shadcn",
    title: "shadcn/ui",
    dependencies: mapDependencyNames([
      "@base-ui/react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-direction",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
      "class-variance-authority",
      "clsx",
      "cmdk",
      "embla-carousel-react",
      "input-otp",
      "lucide-react",
      "next-themes",
      "react-day-picker",
      "react-resizable-panels",
      "recharts",
      "sonner",
      "tailwind-merge",
      "vaul",
    ]),
  },
  ant: {
    id: "ant",
    title: "Ant Design",
    dependencies: mapDependencyNames(["antd", "@ant-design/icons"]),
    indexTsxImports: ['import "antd/dist/reset.css";'],
  },
  mui: {
    id: "mui",
    title: "Material UI",
    dependencies: mapDependencyNames([
      "@emotion/react",
      "@emotion/styled",
      "@mui/icons-material",
      "@mui/material",
    ]),
  },
}

function normalizeProjectUiKitId(rawUiKitId?: string | null): ProjectUiKitId {
  const raw = rawUiKitId?.trim().toLowerCase()
  if (!raw) return DEFAULT_PROJECT_UI_KIT_ID

  if (raw === "none" || raw === "off" || raw === "false" || raw === "0") return "none"
  if (raw === "shadcn") return "shadcn"
  if (raw === "ant" || raw === "antd" || raw === "ant-design") return "ant"
  if (raw === "mui" || raw === "material" || raw === "material-ui") return "mui"

  return DEFAULT_PROJECT_UI_KIT_ID
}

function validateProjectUiKitsConfig() {
  const values = Object.values(projectUiKitsConfig)
  const ids = values.map((it) => it.id)
  const uniqueIds = new Set(ids)

  if (ids.length !== uniqueIds.size) {
    throw new Error("Некорректный конфиг UI kit'ов проекта: повторяющиеся id")
  }

  for (const kit of values) {
    if (!kit.id.trim()) {
      throw new Error("Некорректный конфиг UI kit'ов проекта: пустой id")
    }

    if (!kit.title.trim()) {
      throw new Error(`Некорректный конфиг UI kit'ов проекта: kit '${kit.id}' без title`)
    }
  }
}

export {
  DEFAULT_PROJECT_UI_KIT_ID,
  normalizeProjectUiKitId,
  projectUiKitsConfig,
  validateProjectUiKitsConfig,
  type ProjectUiKitConfig,
}
