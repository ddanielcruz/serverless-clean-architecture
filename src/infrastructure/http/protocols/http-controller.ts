import type { HttpCode } from './http-code'

export interface HttpRequest {
  body: unknown
  headers: Record<string, string>
  query: Record<string, string>
  ipAddress: string
}

export interface HttpResponse {
  statusCode: HttpCode
  body?: unknown
  headers?: Record<string, string>
}

export abstract class HttpController {
  abstract handle(request: HttpRequest): Promise<HttpResponse>
}

export * from './http-code'
