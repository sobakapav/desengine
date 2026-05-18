import { updateSystemToLatestRelease } from "@/lib/system/release"

export async function POST() {
  try {
    const result = await updateSystemToLatestRelease()

    return Response.json({
      ok: true,
      latestVersion: result.latestVersion,
      previousVersion: result.previousVersion,
    })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось обновить систему.",
      },
      { status: 500 },
    )
  }
}
