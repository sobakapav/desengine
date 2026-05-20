import "server-only"

import { getActiveAdapter } from "./adapters"
import { toLlmErrorResponse } from "./errors"
import { getLlmRequestRuntime } from "./runtime"
import { getLlmStatus } from "./status"
import type { LlmStructuredRequest, LlmStructuredResponse } from "./types"

import localConfig from "../system/config/local.cjs"

localConfig.loadLocalConfig()

async function runStructuredLlmRequest(request: LlmStructuredRequest): Promise<LlmStructuredResponse> {
  const adapter = getActiveAdapter()
  const config = adapter.buildConfig()
  const runtime = getLlmRequestRuntime(request.target)

  return adapter.call(request, config, runtime)
}

export { getLlmStatus, runStructuredLlmRequest, toLlmErrorResponse }
