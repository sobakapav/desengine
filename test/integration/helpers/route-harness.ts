type RouteParams = Record<string, string>

type RouteHandlerWithParams<TBody = unknown> = (
  request: Request,
  context: { params: Promise<RouteParams> },
) => Promise<Response>

type InvokeRouteWithParamsOptions<TBody> = {
  body?: TBody
  method?: string
  params?: RouteParams
  url: string
}

function createJsonRequest<TBody>({
  body,
  method = "POST",
  url,
}: Omit<InvokeRouteWithParamsOptions<TBody>, "params">) {
  return new Request(url, {
    method,
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

async function readJsonResponse<TResponse>(response: Response): Promise<TResponse> {
  return response.json() as Promise<TResponse>
}

async function invokeRouteWithParams<TBody, TResponse>(
  handler: RouteHandlerWithParams<TBody>,
  options: InvokeRouteWithParamsOptions<TBody>,
) {
  const response = await handler(
    createJsonRequest({
      body: options.body,
      method: options.method,
      url: options.url,
    }),
    { params: Promise.resolve(options.params ?? {}) },
  )

  return {
    response,
    json: await readJsonResponse<TResponse>(response),
  }
}

export {
  createJsonRequest,
  invokeRouteWithParams,
  readJsonResponse,
}
export type {
  RouteHandlerWithParams,
  RouteParams,
}
