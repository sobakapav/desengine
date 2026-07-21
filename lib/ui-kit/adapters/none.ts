import type { UiKitAdapter } from "../types"

const noneUiKitAdapter = {
  id: "none",
  title: "Только React",
  aliases: ["off", "false", "0"],
  installationOwner: "system",
  customizationPolicy: "reset-on-update",
  userInstallAllowed: false,
  prompt: {
    designSystemLabel: "React without UI kit",
  },
  runtime: {
    dependencies: {},
  },
} satisfies UiKitAdapter

export { noneUiKitAdapter }
