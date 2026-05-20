"use client"

import { THEMES, type ChartConfig } from "@/components/ui/chart-context"

function buildThemeVariables(config: ChartConfig, theme: keyof typeof THEMES) {
  return Object.entries(config)
    .map(([key, itemConfig]) => {
      const color = itemConfig.theme?.[theme] ?? itemConfig.color
      return color ? `  --color-${key}: ${color};` : null
    })
    .join("\n")
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme ?? config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${buildThemeVariables(Object.fromEntries(colorConfig), theme as keyof typeof THEMES)}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

export { ChartStyle }
