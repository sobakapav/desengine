import { notFound } from "next/navigation"

import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getLevelOverview } from "@/lib/system/server"
import { getLevelUrl } from "@/lib/level/navigation"

import { Lab } from "@/components/desengine/lab/LabScreen"

type Params = {
  levelId: string
}

export default async function LevelPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { levelId } = await params
  
  const levelUrl = getLevelUrl(levelId)
  await requireAccessOrRedirect(levelUrl)

  const levelOverview = await getLevelOverview(levelId)
  if (!levelOverview) { notFound() }

  return (
    <Lab
      initLevelOverview={levelOverview}
      initScreen={{ type: "level" }}
      initTaskItem={ null }
      initTaskData={ null }
    />
  )
}
