import React from "react";

import Component from "./Component";
import * as mockModule from "./mock";
import { levelRuntime } from "./level-template-runtime";
import { PreviewRuntimeContractBoundary } from "./preview-runtime-contract";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickPreviewPropsList(): Array<Record<string, unknown>> {
  const mockList = (mockModule as { mock?: unknown }).mock;

  const exportedMocks = Object.entries(mockModule)
    .filter(([exportName, value]) => exportName !== "default" && exportName !== "mock" && isPlainObject(value))
    .map(([, value]) => value);

  if (exportedMocks.length > 0) {
    return exportedMocks;
  }

  if (Array.isArray(mockList)) {
    const entries = mockList.filter(isPlainObject);
    return entries.length > 0 ? entries : [{}];
  }

  return isPlainObject(mockList) ? [mockList] : [{}];
}

export default function App() {
  void levelRuntime;
  const previewPropsList = pickPreviewPropsList();

  return (
    <main className="desengine-preview-root">
      {previewPropsList.map((previewProps, index) => (
        <PreviewRuntimeContractBoundary key={index}>
          <Component {...previewProps} />
        </PreviewRuntimeContractBoundary>
      ))}
    </main>
  );
}
