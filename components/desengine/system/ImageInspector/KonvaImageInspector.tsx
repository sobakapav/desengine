/**
 * Минимальный инспектор изображения на базе react-konva.
 * Первый этап: только просмотр (pan/zoom/fit/reset) + экспорт метаданных изображения.
 */

"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { Dispatch, MutableRefObject, ReactNode, RefObject, SetStateAction } from "react"
import { Stage, Layer, Image as KonvaImage } from "react-konva"

import { cn } from "@/lib/system/utils"
import type { ImageInspectorMeta } from "./types"

type KonvaImageInspectorProps = {
  src: string
  alt?: string
  className?: string
  imageWidth?: number
  imageHeight?: number
  onMetaReady?: (meta: ImageInspectorMeta) => void
  onLoadError?: () => void
}

type Size = {
  width: number
  height: number
}

type Viewport = {
  scale: number
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getCenteredViewport(containerSize: Size, imageSize: Size, scale: number) {
  return {
    scale,
    x: (containerSize.width - imageSize.width * scale) / 2,
    y: (containerSize.height - imageSize.height * scale) / 2,
  } satisfies Viewport
}

function getZoomViewport({
  containerSize,
  direction,
  point,
  scaleBy,
  viewport,
}: {
  containerSize: Size
  direction: "in" | "out"
  point?: { x: number; y: number }
  scaleBy: number
  viewport: Viewport
}) {
  const oldScale = viewport.scale
  const newScale =
    direction === "in"
      ? clamp(oldScale * scaleBy, 0.05, 20)
      : clamp(oldScale / scaleBy, 0.05, 20)
  const anchor = point ?? { x: containerSize.width / 2, y: containerSize.height / 2 }
  const mousePointTo = {
    x: (anchor.x - viewport.x) / oldScale,
    y: (anchor.y - viewport.y) / oldScale,
  }

  return {
    scale: newScale,
    x: anchor.x - mousePointTo.x * newScale,
    y: anchor.y - mousePointTo.y * newScale,
  } satisfies Viewport
}

function useContainerSize(containerRef: RefObject<HTMLDivElement | null>) {
  const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    let frameId = 0

    const measure = () => {
      const rect = el.getBoundingClientRect()
      setContainerSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      })
    }

    const ro = new ResizeObserver(() => {
      measure()
    })

    measure()
    frameId = window.requestAnimationFrame(measure)
    ro.observe(el)

    return () => {
      ro.disconnect()
      window.cancelAnimationFrame(frameId)
    }
  }, [containerRef])

  return containerSize
}

function useLoadedImage({
  imageHeight,
  imageWidth,
  onLoadError,
  onMetaReady,
  src,
}: Pick<KonvaImageInspectorProps, "imageHeight" | "imageWidth" | "onLoadError" | "onMetaReady" | "src">) {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [imageSize, setImageSize] = useState<Size>({
    width: Math.max(imageWidth ?? 0, 0),
    height: Math.max(imageHeight ?? 0, 0),
  })
  const [hasLoadError, setHasLoadError] = useState(false)

  useEffect(() => {
    let canceled = false
    const img = new window.Image()
    img.decoding = "async"

    if (!src.startsWith("data:") && !src.startsWith("/")) {
      img.crossOrigin = "anonymous"
    }

    img.onload = () => {
      if (canceled) return
      const size = {
        width: Math.max(img.naturalWidth, imageWidth ?? 0),
        height: Math.max(img.naturalHeight, imageHeight ?? 0),
      }
      setImage(img)
      setImageSize(size)
      setHasLoadError(false)
      onMetaReady?.({ naturalWidth: size.width, naturalHeight: size.height })
    }

    img.onerror = () => {
      if (canceled) return
      setImage(null)
      setImageSize({
        width: Math.max(imageWidth ?? 0, 0),
        height: Math.max(imageHeight ?? 0, 0),
      })
      setHasLoadError(true)
      onLoadError?.()
    }

    img.src = src

    return () => {
      canceled = true
    }
  }, [src, imageHeight, imageWidth, onMetaReady, onLoadError])

  return { image, imageSize, hasLoadError }
}

function LoadingImageFrame({
  className,
  hasLoadError,
}: Pick<KonvaImageInspectorProps, "className"> & {
  hasLoadError: boolean
}) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center text-sm text-neutral-500", className)}>
      {hasLoadError ? "Не удалось загрузить изображение" : "Загрузка изображения…"}
    </div>
  )
}

function InspectorFrame({
  children,
  className,
  containerRef,
}: {
  children: ReactNode
  className?: string
  containerRef: RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={containerRef} className={cn("relative min-h-[180px] w-full overflow-hidden rounded-md border bg-white", className)}>
      {children}
    </div>
  )
}

function InspectorToolbar({
  onFit,
  onReset,
  onZoom,
  viewport,
}: {
  onFit: () => void
  onReset: () => void
  onZoom: (direction: "in" | "out") => void
  viewport: Viewport
}) {
  return (
    <div className="absolute left-2 top-2 z-10 flex items-center gap-2 rounded-md border bg-white/90 px-2 py-1 backdrop-blur">
      <button type="button" className="rounded px-2 py-1 text-xs hover:bg-neutral-100" onClick={() => onZoom("out")} aria-label="Уменьшить" title="Уменьшить">
        -
      </button>
      <button type="button" className="rounded px-2 py-1 text-xs hover:bg-neutral-100" onClick={() => onZoom("in")} aria-label="Увеличить" title="Увеличить">
        +
      </button>
      <button type="button" className="rounded px-2 py-1 text-xs hover:bg-neutral-100" onClick={onFit} title="Fit по экрану">
        Fit
      </button>
      <button type="button" className="rounded px-2 py-1 text-xs hover:bg-neutral-100" onClick={onReset} title="Сброс (1:1)">
        1:1
      </button>
      <div className="ml-1 text-[11px] tabular-nums text-neutral-500">
        {Math.round(viewport.scale * 100)}%
      </div>
    </div>
  )
}

function ViewerStage({
  containerSize,
  image,
  imageSize,
  setViewport,
  stageRef,
  viewport,
}: {
  containerSize: Size
  image: HTMLImageElement
  imageSize: Size
  setViewport: Dispatch<SetStateAction<Viewport>>
  stageRef: MutableRefObject<import("konva/lib/Stage").Stage | null>
  viewport: Viewport
}) {
  return (
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
        const pointer = stageRef.current?.getPointerPosition()
        if (!pointer) return

        setViewport((current) => getZoomViewport({
          containerSize,
          direction: e.evt.deltaY > 0 ? "out" : "in",
          point: pointer,
          scaleBy: 1.05,
          viewport: current,
        }))
      }}
    >
      <Layer>
        <KonvaImage image={image} x={0} y={0} width={imageSize.width} height={imageSize.height} />
      </Layer>
    </Stage>
  )
}

function KonvaImageInspector({
  src,
  className,
  imageWidth,
  imageHeight,
  onMetaReady,
  onLoadError,
}: KonvaImageInspectorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<import("konva/lib/Stage").Stage | null>(null)
  const containerSize = useContainerSize(containerRef)
  const { image, imageSize, hasLoadError } = useLoadedImage({
    src,
    imageWidth,
    imageHeight,
    onMetaReady,
    onLoadError,
  })
  const [viewport, setViewport] = useState<Viewport>({ scale: 1, x: 0, y: 0 })
  const [isViewportInitialized, setIsViewportInitialized] = useState(false)
  const canRenderStage = containerSize.width > 0 && containerSize.height > 0 && image != null && imageSize.width > 0 && imageSize.height > 0
  const fitViewport = useMemo(() => {
    if (!canRenderStage) return null
    const rawScale = Math.min(containerSize.width / imageSize.width, containerSize.height / imageSize.height)
    return getCenteredViewport(containerSize, imageSize, clamp(rawScale, 0.05, 20))
  }, [canRenderStage, containerSize, imageSize])

  useEffect(() => {
    setIsViewportInitialized(false)
    setViewport({ scale: 1, x: 0, y: 0 })
  }, [src])

  useEffect(() => {
    if (!canRenderStage || isViewportInitialized) return

    setViewport(getCenteredViewport(containerSize, imageSize, 1))
    setIsViewportInitialized(true)
  }, [canRenderStage, containerSize, imageSize, isViewportInitialized])

  return (
    <InspectorFrame className={className} containerRef={containerRef}>
      {canRenderStage ? (
        <>
          <InspectorToolbar
            viewport={viewport}
            onFit={() => fitViewport && setViewport(fitViewport)}
            onReset={() => setViewport(getCenteredViewport(containerSize, imageSize, 1))}
            onZoom={(direction) => setViewport((current) => getZoomViewport({ containerSize, direction, scaleBy: 1.15, viewport: current }))}
          />
          <ViewerStage
            containerSize={containerSize}
            image={image}
            imageSize={imageSize}
            setViewport={setViewport}
            stageRef={stageRef}
            viewport={viewport}
          />
        </>
      ) : (
        <LoadingImageFrame hasLoadError={hasLoadError} />
      )}
    </InspectorFrame>
  )
}

export { KonvaImageInspector }
