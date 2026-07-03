import { ResourceState } from "@/lib/system/types"
import { BaseProps } from "./Base"
import { Badge } from "@/components/ui/badge"

const ResourceStateBulletVariants = {
  ready: {
    className: "",
    sign: "ГОТОВО",
  },
  warning: {
    className: "",
    sign: "НЕ КРИТИЧНО",
  },
   blocked: {
    className: "",
    sign: "НЕТ ДОСТУПА",
  },
} as const

type ResourceStateBulletProps = BaseProps & {
  state: ResourceState
}

function ResourceStateBullet({ state }: ResourceStateBulletProps) {
  return (
<Badge
  className={`h-6 border border-black bg-white px-2 text-xs font-semibold uppercase leading-none text-black ${ResourceStateBulletVariants[state].className}`}
>
  {ResourceStateBulletVariants[state].sign}
</Badge>
  )
}

export {
  ResourceStateBullet
}
