export type HttpRequest<TBody> = {
  url: string
  headers?: Record<string, string>
  body?: TBody
  query?: Record<string, string>
}

export type HttpRequestWithoutBody = Omit<HttpRequest<never>, 'body'>

export type HttpResponse<TBody> = {
  statusCode: number
  headers: Record<string, string>
  body: TBody
}

export type HttpClientOptions = {
  baseUrl?: string
}

export abstract class HttpClient {
  constructor(readonly options: HttpClientOptions | null = null) {}

  abstract get<TResponse = unknown>(
    request: HttpRequestWithoutBody,
  ): Promise<HttpResponse<TResponse>>

  abstract post<TResponse = unknown, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>>

  abstract put<TResponse = unknown, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>>

  abstract patch<TResponse = unknown, TBody = unknown>(
    request: HttpRequest<TBody>,
  ): Promise<HttpResponse<TResponse>>

  abstract delete<TResponse = unknown>(
    request: HttpRequestWithoutBody,
  ): Promise<HttpResponse<TResponse>>
}
