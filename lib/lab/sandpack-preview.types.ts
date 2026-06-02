import type { Project, ProjectCompatibility } from "@/lib/project/runtime"
import type { SandpackUiKitId } from "@/lib/lab/sandpack-ui-kits.config"

type SandpackFileEntry = string | {
  code: string
  hidden?: boolean
  readOnly?: boolean
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
  shadcnFiles?: Record<string, string>
  supportFiles?: Record<string, string>
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
  project: Project & {
    effectiveUiKitId: SandpackUiKitId
    compatibility: ProjectCompatibility
  }
  debug?: {
    shimVersion: string
    rcShimPaths: string[]
    pickerLocaleShim?: {
      enUsJs?: string
      enUsIndexJs?: string
    }
  }
}

export type {
  SandpackFileEntry,
  SandpackPreviewFiles,
  SandpackPreviewPayload,
  SandpackPreviewSourceFiles,
}
