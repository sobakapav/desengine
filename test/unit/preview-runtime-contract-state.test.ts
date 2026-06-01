// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Preview поднимает runtime-ошибку Sandpack в host UI"

import { describe, expect, it } from "vitest";

import {
  mergePreviewRuntimeContractState,
  type PreviewRuntimeContractState,
} from "../../components/desengine/lab/InOut/preview-runtime-contract-state";

function state(status: PreviewRuntimeContractState["status"], message = ""): PreviewRuntimeContractState {
  return { status, message };
}

describe("mergePreviewRuntimeContractState", () => {
  it("разрешает loading обновлять только idle/loading host-state", () => {
    expect(mergePreviewRuntimeContractState(
      state("idle"),
      state("loading", "manifest"),
    )).toEqual(state("loading", "manifest"));

    expect(mergePreviewRuntimeContractState(
      state("loading", "old"),
      state("loading", "new"),
    )).toEqual(state("loading", "new"));

    expect(mergePreviewRuntimeContractState(
      state("ready"),
      state("loading", "late loading"),
    )).toEqual(state("ready"));
  });

  it("не даёт позднему внутреннему render-error затереть уже подтверждённый ready", () => {
    expect(mergePreviewRuntimeContractState(
      state("ready"),
      state("render-error", "timeout"),
    )).toEqual(state("ready"));
  });

  it("разрешает iframe-контракту заменить loading на ready или unstyled-dom", () => {
    expect(mergePreviewRuntimeContractState(
      state("loading", "manifest"),
      state("ready"),
    )).toEqual(state("ready"));

    expect(mergePreviewRuntimeContractState(
      state("loading", "manifest"),
      state("unstyled-dom", "css missing"),
    )).toEqual(state("unstyled-dom", "css missing"));
  });
});
