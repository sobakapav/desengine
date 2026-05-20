"use client"

import { useState } from "react"

import { KonvaImageInspector, type ImageInspectorMeta } from "@/components/desengine/system/ImageInspector"

const DEMO_PNG_URL = "/e2e/1x1.png"

function ClientDemo() {
  const [meta, setMeta] = useState<ImageInspectorMeta | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div className="max-w-3xl">
      <img
        src={DEMO_PNG_URL}
        alt=""
        style={{ display: "none" }}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgLoaded(false)}
      />
      <KonvaImageInspector
        src={DEMO_PNG_URL}
        alt="Демо-картинка"
        className="h-[520px]"
        onMetaReady={setMeta}
        onLoadError={() => setLoadError(true)}
      />

      <div className="mt-2 text-xs text-neutral-700">
        Meta: {meta ? `${meta.naturalWidth}×${meta.naturalHeight}` : "—"}
      </div>
      {loadError ? (
        <div className="mt-1 text-xs text-red-700">Load error</div>
      ) : null}
      <div className="mt-1 text-[11px] text-neutral-500">ImgLoaded: {imgLoaded ? "yes" : "no"}</div>
    </div>
  )
}

export { ClientDemo, DEMO_PNG_URL }
