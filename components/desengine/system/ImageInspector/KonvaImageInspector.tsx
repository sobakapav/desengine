/**
 * Минимальный инспектор изображения на базе react-konva.
 * Первый этап: только просмотр (pan/zoom/fit/reset) + экспорт метаданных изображения.
 */

"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Stage, Layer, Image as KonvaImage } from "react-konva"

import { cn } from "@/lib/system/utils"
import type { ImageInspectorMeta } from "./types"

type KonvaImageInspectorProps = {
  src: string
  alt?: string
  className?: string
  onMetaReady?: (meta: ImageInspectorMeta) => void
  onLoadError?: () => void
}

type Viewport = {
  scale: number
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function KonvaImageInspector({ src, alt, className, onMetaReady, onLoadError }: KonvaImageInspectorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<import("konva/lib/Stage").Stage | null>(null)

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect()
      setContainerSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      })
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let canceled = false

    // Важно: Konva работает с HTMLImageElement.
    const img = new window.Image()
    img.decoding = "async"
    // Для внешних доменов CORS зависит от сервера. Для same-origin crossOrigin не нужен.
    // Для data: URL crossOrigin может ломать загрузку в некоторых браузерах.
    const isDataUrl = src.startsWith("data:")
    const isSameOriginAbsolute = src.startsWith("/")
    if (!isDataUrl && !isSameOriginAbsolute) {
      img.crossOrigin = "anonymous"
    }

    img.onload = () => {
      if (canceled) return
      setImage(img)
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
      onMetaReady?.({ naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight })
    }

    img.onerror = () => {
      if (canceled) return
      setImage(null)
      setImageSize({ width: 0, height: 0 })
      onLoadError?.()
    }

    img.src = src

    return () => {
      canceled = true
    }
  }, [src, onMetaReady])

  const canRenderStage =
    containerSize.width > 0 &&
    containerSize.height > 0 &&
    image != null &&
    imageSize.width > 0 &&
    imageSize.height > 0

  const fitViewport = useMemo(() => {
    if (!canRenderStage) return null

    const rawScale = Math.min(
      containerSize.width / imageSize.width,
      containerSize.height / imageSize.height
    )
    const scale = clamp(rawScale, 0.05, 20)

    const x = (containerSize.width - imageSize.width * scale) / 2
    const y = (containerSize.height - imageSize.height * scale) / 2

    return { scale, x, y } satisfies Viewport
  }, [canRenderStage, containerSize.width, containerSize.height, imageSize.width, imageSize.height])

  // При первой готовности картинки автоматически делаем fit.
  useEffect(() => {
    if (!fitViewport) return
    setViewport(fitViewport)
  }, [fitViewport?.scale, fitViewport?.x, fitViewport?.y])

  const applyFit = () => {
    if (!fitViewport) return
    setViewport(fitViewport)
  }

  const applyReset = () => {
    if (!canRenderStage) return
    const scale = 1
    const x = (containerSize.width - imageSize.width * scale) / 2
    const y = (containerSize.height - imageSize.height * scale) / 2
    setViewport({ scale, x, y })
  }

  const applyZoom = (direction: "in" | "out") => {
    const stage = stageRef.current
    if (!stage) return

    const scaleBy = 1.15
    const oldScale = viewport.scale
    const newScale =
      direction === "in"
        ? clamp(oldScale * scaleBy, 0.05, 20)
        : clamp(oldScale / scaleBy, 0.05, 20)

    // Зум относительно центра вьюпорта, чтобы кнопки не "прыгали".
    const center = { x: containerSize.width / 2, y: containerSize.height / 2 }
    const mousePointTo = {
      x: (center.x - viewport.x) / oldScale,
      y: (center.y - viewport.y) / oldScale,
    }

    const next = {
      scale: newScale,
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    } satisfies Viewport

    setViewport(next)
  }

  if (!canRenderStage) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative min-h-[180px] w-full overflow-hidden rounded-md border bg-white",
          className
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
          {alt ?? "Загрузка изображения…"}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-[180px] w-full overflow-hidden rounded-md border bg-white",
        className
      )}
    >
      <div className="absolute left-2 top-2 z-10 flex items-center gap-2 rounded-md border bg-white/90 px-2 py-1 backdrop-blur">
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-neutral-100"
          onClick={() => applyZoom("out")}
          aria-label="Уменьшить"
          title="Уменьшить"
        >
          -
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-neutral-100"
          onClick={() => applyZoom("in")}
          aria-label="Увеличить"
          title="Увеличить"
        >
          +
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-neutral-100"
          onClick={applyFit}
          title="Fit по экрану"
        >
          Fit
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs hover:bg-neutral-100"
          onClick={applyReset}
          title="Сброс (1:1)"
        >
          1:1
        </button>
        <div className="ml-1 text-[11px] tabular-nums text-neutral-500">
          {Math.round(viewport.scale * 100)}%
        </div>
      </div>

      <Stage
        ref={(node) => {
          stageRef.current = node
        }}
        width={containerSize.width}
        height={containerSize.height}
        draggable
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        onDragMove={(e) => {
          const node = e.target
          setViewport((prev) => ({ ...prev, x: node.x(), y: node.y() }))
        }}
        onWheel={(e) => {
          e.evt.preventDefault()
          const stage = stageRef.current
          if (!stage) return

          const oldScale = viewport.scale
          const pointer = stage.getPointerPosition()
          if (!pointer) return

          const scaleBy = 1.05
          const direction = e.evt.deltaY > 0 ? "out" : "in"
          const newScale =
            direction === "in"
              ? clamp(oldScale * scaleBy, 0.05, 20)
              : clamp(oldScale / scaleBy, 0.05, 20)

          const mousePointTo = {
            x: (pointer.x - viewport.x) / oldScale,
            y: (pointer.y - viewport.y) / oldScale,
          }

          const next = {
            scale: newScale,
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          } satisfies Viewport

          setViewport(next)
        }}
      >
        <Layer>
          <KonvaImage image={image} x={0} y={0} width={imageSize.width} height={imageSize.height} />
        </Layer>
      </Stage>
    </div>
  )
}

export { KonvaImageInspector }
