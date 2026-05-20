"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import type { TooltipValueType } from "recharts"

import { useChart } from "@/components/ui/chart-context"
import { getPayloadConfigFromPayload } from "@/components/ui/chart-utils"
import { cn } from "@/lib/system/utils"

type TooltipNameType = number | string
type TooltipIndicator = "line" | "dot" | "dashed"

type ChartTooltipContentProps = React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: TooltipIndicator
    nameKey?: string
    labelKey?: string
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
    "accessibilityLayer"
  >

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()
  const tooltipLabel = useTooltipLabel({ config, hideLabel, label, labelClassName, labelFormatter, labelKey, payload })

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs/relaxed shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => (
            <TooltipItem
              key={index}
              color={color}
              config={config}
              formatter={formatter}
              hideIndicator={hideIndicator}
              indicator={indicator}
              item={item}
              itemIndex={index}
              nameKey={nameKey}
              nestLabel={nestLabel}
              tooltipLabel={tooltipLabel}
            />
          ))}
      </div>
    </div>
  )
}

function useTooltipLabel({ config, hideLabel, label, labelClassName, labelFormatter, labelKey, payload }: Pick<ChartTooltipContentProps, "hideLabel" | "label" | "labelClassName" | "labelFormatter" | "labelKey" | "payload"> & { config: ReturnType<typeof useChart>["config"] }) {
  return React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value = !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label

    if (labelFormatter) {
      return <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [config, hideLabel, label, labelClassName, labelFormatter, labelKey, payload])
}

function TooltipItem({
  color,
  config,
  formatter,
  hideIndicator,
  indicator,
  item,
  itemIndex,
  nameKey,
  nestLabel,
  tooltipLabel,
}: {
  color?: string
  config: ReturnType<typeof useChart>["config"]
  formatter: ChartTooltipContentProps["formatter"]
  hideIndicator: boolean
  indicator: TooltipIndicator
  item: NonNullable<ChartTooltipContentProps["payload"]>[number]
  itemIndex: number
  nameKey?: string
  nestLabel: boolean
  tooltipLabel: React.ReactNode
}) {
  const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
  const itemConfig = getPayloadConfigFromPayload(config, item, key)
  const indicatorColor = color ?? item.payload?.fill ?? item.color

  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
        indicator === "dot" && "items-center"
      )}
    >
      {formatter && item?.value !== undefined && item.name ? (
        formatter(item.value, item.name, item, itemIndex, item.payload)
      ) : (
        <DefaultTooltipItem
          hideIndicator={hideIndicator}
          indicator={indicator}
          indicatorColor={indicatorColor}
          item={item}
          itemConfig={itemConfig}
          nestLabel={nestLabel}
          tooltipLabel={tooltipLabel}
        />
      )}
    </div>
  )
}

function DefaultTooltipItem({
  hideIndicator,
  indicator,
  indicatorColor,
  item,
  itemConfig,
  nestLabel,
  tooltipLabel,
}: {
  hideIndicator: boolean
  indicator: TooltipIndicator
  indicatorColor?: string
  item: NonNullable<ChartTooltipContentProps["payload"]>[number]
  itemConfig: ReturnType<typeof getPayloadConfigFromPayload>
  nestLabel: boolean
  tooltipLabel: React.ReactNode
}) {
  return (
    <>
      {itemConfig?.icon ? (
        <itemConfig.icon />
      ) : (
        !hideIndicator && <TooltipIndicatorMark color={indicatorColor} indicator={indicator} nestLabel={nestLabel} />
      )}
      <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
        <div className="grid gap-1.5">
          {nestLabel ? tooltipLabel : null}
          <span className="text-muted-foreground">{itemConfig?.label ?? item.name}</span>
        </div>
        {item.value != null && (
          <span className="font-mono font-medium text-foreground tabular-nums">
            {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
          </span>
        )}
      </div>
    </>
  )
}

function TooltipIndicatorMark({
  color,
  indicator,
  nestLabel,
}: {
  color?: string
  indicator: TooltipIndicator
  nestLabel: boolean
}) {
  return (
    <div
      className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
        "h-2.5 w-2.5": indicator === "dot",
        "w-1": indicator === "line",
        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
        "my-0.5": nestLabel && indicator === "dashed",
      })}
      style={{ "--color-bg": color, "--color-border": color } as React.CSSProperties}
    />
  )
}

export { ChartTooltip, ChartTooltipContent }
