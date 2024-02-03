import type { HttpCode } from './http-code'

export interface HttpRequest {
  body?: unknown
}

export interface HttpResponse {
  statusCode: HttpCode
  body?: unknown
}

export abstract class HttpController {
  abstract handle(request: HttpRequest): Promise<HttpResponse>
}

export * from './http-code'
