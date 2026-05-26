import { ResourceState } from "@/lib/system/types"
import { BaseProps } from "./Base"
import { Badge } from "@/components/ui/badge"

const ResourceStateBulletVariants = {
  ready: {
    className: "!border-emerald-600 text-emerald-700",
    sign: "ГОТОВО",
  },
  warning: {
    className: "!border-amber-500 text-amber-600",
    sign: "ПРОВЕРИТЬ",
  },
  blocked: {
    className: "!border-red-500 text-red-600",
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