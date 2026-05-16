import { Instruction, Resource } from "@/lib/system/types"
import { ResourceCard } from "./ResourceCard"

type ResourceCardListProps = {
  resources: Resource[]
  instructions?: Instruction[]
}

function ResourceCardList({
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
          />
        )
      })}
    </div>
  )
}

export {
  ResourceCardList
}