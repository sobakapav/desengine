import type { UiKitAdapter } from "../types"
import { mapDependencyNames } from "./shared"

const muiUiKitAdapter = {
  id: "mui",
  title: "Material UI",
  aliases: ["material", "material-ui"],
  installationOwner: "system",
  customizationPolicy: "reset-on-update",
  userInstallAllowed: false,
  prompt: {
    designSystemLabel: "Material UI",
  },
  runtime: {
    dependencies: mapDependencyNames([
      "@emotion/react",
      "@emotion/styled",
      "@mui/icons-material",
      "@mui/material",
    ]),
  },
} satisfies UiKitAdapter

export { muiUiKitAdapter }
