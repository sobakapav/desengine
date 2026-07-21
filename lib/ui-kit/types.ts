type UiKitAdapterInstallationOwner = "system"

type UiKitAdapterCustomizationPolicy = "reset-on-update"

type UiKitRuntimeContract = {
  dependencies: Record<string, string>
  indexTsxImports?: string[]
}

type UiKitPromptContract = {
  designSystemLabel: string
}

type UiKitAdapter = {
  id: string
  title: string
  aliases?: string[]
  customizationPolicy: UiKitAdapterCustomizationPolicy
  installationOwner: UiKitAdapterInstallationOwner
  prompt: UiKitPromptContract
  runtime: UiKitRuntimeContract
  userInstallAllowed: false
}

export type {
  UiKitAdapter,
  UiKitAdapterCustomizationPolicy,
  UiKitAdapterInstallationOwner,
  UiKitPromptContract,
  UiKitRuntimeContract,
}
