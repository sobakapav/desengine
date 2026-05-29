import { ResourceState } from "@/lib/system/types"
import { BaseProps } from "./Base"
import { Badge } from "@/components/ui/badge"

const ResourceStateBulletVariants = {
  ready: {
    className: "!border-emerald-500 text-emerald-600",
    sign: "ГОТОВО",
  },
  warning: {
    className: "!border-yellow-500 text-yellow-600",
    sign: "НЕ КРИТИЧНО",
  },
   blocked: {
    className: "!border-red-500 text-red-500",
    sign: "НЕТ ДОСТУПА",
  },
} as const

type ResourceStateBulletProps = BaseProps & {
  state: ResourceState
}

function ResourceStateBullet({ state }: ResourceStateBulletProps) {
  return (
<Badge
  className={`h-6 rounded-md border bg-transparent px-2 text-xs font-semibold uppercase leading-none ${ResourceStateBulletVariants[state].className}`}
>
  {ResourceStateBulletVariants[state].sign}
</Badge>
  )
}

export {
  ResourceStateBullet
}