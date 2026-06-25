import { describe, expect, it } from "vitest"

import {
  getPreviewCheckGuardMessage,
  readPreviewRuntimeContractMessage,
} from "@/components/desengine/lab/InOut/preview-runtime-contract-message"

describe("preview runtime contract message", () => {
  it("принимает только contract message текущей preview-сессии", () => {
    expect(readPreviewRuntimeContractMessage({
      source: "desengine-sandpack-preview",
      type: "contract",
      status: "ready",
      previewSessionId: "session-1",
    }, "session-1")).toEqual({
      source: "desengine-sandpack-preview",
      type: "contract",
      status: "ready",
      previewSessionId: "session-1",
    })
  })

  it("игнорирует сообщения без previewSessionId или от другой сессии", () => {
    expect(readPreviewRuntimeContractMessage({
      source: "desengine-sandpack-preview",
      type: "contract",
      status: "render-error",
      message: "anonymous",
    }, "session-1")).toBeNull()

    expect(readPreviewRuntimeContractMessage({
      source: "desengine-sandpack-preview",
      type: "contract",
      status: "render-error",
      message: "stale",
      previewSessionId: "session-old",
    }, "session-1")).toBeNull()
  })

  it("строит явную диагностику для блокировки check entrypoint при broken preview", () => {
    expect(getPreviewCheckGuardMessage({
      status: "render-error",
      message: "Тестовая runtime-ошибка preview",
    })).toBe(
      "Проверка результата временно недоступна: предпросмотр сломан и не может подтвердить рендер компонента. Сначала исправьте ошибку предпросмотра: Тестовая runtime-ошибка preview",
    )
  })

  it("не блокирует check entrypoint для состояний без честного preview failure", () => {
    expect(getPreviewCheckGuardMessage({
      status: "ready",
      message: "",
    })).toBeNull()

    expect(getPreviewCheckGuardMessage({
      status: "unstyled-dom",
      message: "CSS ещё не подтверждён",
    })).toBeNull()
  })
})
