import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

async function createTempUserStateRoot(prefix = "desengine-integration-user-") {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix))

  return {
    root,
    cleanup: async () => {
      await rm(root, { recursive: true, force: true })
    },
  }
}

export { createTempUserStateRoot }
