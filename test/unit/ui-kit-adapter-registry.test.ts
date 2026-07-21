// @openSpec capability: ui-kit-adapters
// @openSpec scenarios:
// @openSpec  - "Система читает поддержанный UI kit"
// @openSpec  - "Пользователь выбирает поддержанный UI kit для проекта"
// @openSpec  - "Система обновляет встроенный UI kit"

import { describe, expect, it } from "vitest"

import {
  DEFAULT_UI_KIT_ADAPTER_ID,
  bundledUiKitAdapters,
  normalizeUiKitAdapterId,
  uiKitAdapterRegistry,
} from "../../lib/ui-kit"

describe("ui kit adapter registry", () => {
  it("хранит встроенные адаптеры как явную системную сущность", () => {
    expect(bundledUiKitAdapters.map((adapter) => adapter.id)).toEqual(["none", "shadcn", "ant", "mui"])
    expect(uiKitAdapterRegistry.ant).toMatchObject({
      id: "ant",
      installationOwner: "system",
      customizationPolicy: "reset-on-update",
      userInstallAllowed: false,
      runtime: {
        dependencies: {
          antd: "*",
          "@ant-design/icons": "*",
        },
        indexTsxImports: ['import "antd/dist/reset.css";'],
      },
    })
  })

  it("нормализует project ui kit через adapter registry, а не через произвольные npm-пакеты", () => {
    expect(DEFAULT_UI_KIT_ADAPTER_ID).toBe("shadcn")
    expect(normalizeUiKitAdapterId("antd")).toBe("ant")
    expect(normalizeUiKitAdapterId("material-ui")).toBe("mui")
    expect(normalizeUiKitAdapterId("unknown-package")).toBe("shadcn")
  })
})
