import type { UiKitAdapter } from "../types"
import { mapDependencyNames } from "./shared"

const antUiKitAdapter = {
  id: "ant",
  title: "Ant Design",
  aliases: ["antd", "ant-design"],
  installationOwner: "system",
  customizationPolicy: "reset-on-update",
  userInstallAllowed: false,
  prompt: {
    designSystemLabel: "Ant Design",
  },
  runtime: {
    dependencies: mapDependencyNames(["antd", "@ant-design/icons"]),
    indexTsxImports: ['import "antd/dist/reset.css";'],
  },
} satisfies UiKitAdapter

export { antUiKitAdapter }
