import type { UniqueEntityId } from '@/core/entities/unique-entity-id'

import type { HttpCode } from './http-code'

export interface HttpRequestSession {
  userId: UniqueEntityId
  sessionId: UniqueEntityId
}

export interface HttpRequest {
  body: unknown
  headers: Record<string, string>
  query: Record<string, string>
  ipAddress: string
  session: HttpRequestSession | null
}

export interface HttpResponse {
  statusCode: HttpCode
  body?: unknown
  headers?: Record<string, string | string[]>
}

export abstract class HttpController {
  abstract handle(request: HttpRequest): Promise<HttpResponse>
}

export * from './http-code'
