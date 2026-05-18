import { Instruction, Resource } from "@/lib/system/types"
import { ResourceCard } from "./ResourceCard"
import type { ReactNode } from "react"

type ResourceCardListProps = {
  renderRemediationControl?: (resource: Resource) => ReactNode
  resources: Resource[]
  instructions?: Instruction[]
}

function ResourceCardList({
  renderRemediationControl,
  resources,
  instructions=[],
}: ResourceCardListProps) {
  return (
    <div className="w-full">
      {resources.map((item) => {
        return (
          <ResourceCard
            key={item.id}
            resource={item}
          >
            {renderRemediationControl?.(item)}
          </ResourceCard>
        )
      })}
    </div>
  )
}

export {
  ResourceCardList
}
