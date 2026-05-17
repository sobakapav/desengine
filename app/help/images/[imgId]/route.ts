import { NextResponse } from "next/server"

import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { readHelpImageAsset } from "@/lib/help/content"

type HelpImageRouteContext = {
  params: Promise<{
    imgId: string
  }>
}

export async function GET(_request: Request, context: HelpImageRouteContext) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { imgId } = await context.params
  const asset = await readHelpImageAsset(imgId)

  if (!asset) {
    return NextResponse.json({ error: "Help-картинка не найдена" }, { status: 404 })
  }

  return new NextResponse(new Uint8Array(asset.body), {
    headers: {
      "Cache-Control": "public, max-age=60",
      "Content-Type": asset.contentType,
    },
  })
}
