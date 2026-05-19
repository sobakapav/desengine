"use client"

import { useState } from "react"

import { KonvaImageInspector, type ImageInspectorMeta } from "@/components/desengine/system/ImageInspector"

function ClientDemo() {
  const [meta, setMeta] = useState<ImageInspectorMeta | null>(null)

  return (
    <div className="max-w-3xl">
      <KonvaImageInspector
        src="/next.svg"
        alt="Next.js logo"
        className="h-[520px]"
        onMetaReady={setMeta}
      />

      <div className="mt-3 text-sm text-neutral-600">
        Управление: перетаскивание мышью = панорамирование, колесо = зум, кнопки = fit/1:1.
      </div>

      <div className="mt-2 text-xs text-neutral-600">
        Meta: {meta ? `${meta.naturalWidth}×${meta.naturalHeight}` : "—"}
      </div>
    </div>
  )
}

export { ClientDemo }

