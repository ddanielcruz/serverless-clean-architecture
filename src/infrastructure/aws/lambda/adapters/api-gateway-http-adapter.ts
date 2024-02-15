import type { APIGatewayProxyHandler } from 'aws-lambda'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type {
  HttpController,
  HttpRequest,
} from '@/infrastructure/http/protocols/http-controller'

type RequestAuthorizer = {
  principalId: string
  session: string
}

export function apiGatewayHttpAdapter(
  controller: HttpController,
): APIGatewayProxyHandler {
  return async (event) => {
    const request: HttpRequest = {
      body: event.body,
      headers: sanitizeMapProperty(event.headers),
      query: event.queryStringParameters
        ? sanitizeMapProperty(event.queryStringParameters)
        : {},
      ipAddress: event.requestContext.identity.sourceIp,
      session: getRequestSession(event.requestContext.authorizer),
    }

    const response = await controller.handle(request)

    return {
      statusCode: response.statusCode,
      body: response.body ? JSON.stringify(response.body) : '',
      multiValueHeaders: Object.entries(response.headers || {}).reduce(
        (acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value : [value]
          return acc
        },
        {} as Record<string, string[]>,
      ),
    }
  }
}

function sanitizeMapProperty(
  raw: Record<string, string | undefined>,
): Record<string, string> {
  return Object.entries(raw).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value) {
        acc[key.toLowerCase()] = value
      }

      return acc
    },
    {},
  )
}

function getRequestSession(authorizer: unknown): HttpRequest['session'] {
  if (isAuthorized(authorizer)) {
    return {
      userId: new UniqueEntityId(authorizer.principalId),
      sessionId: new UniqueEntityId(authorizer.session),
    }
  }

  return null
}

function isAuthorized(authorizer: unknown): authorizer is RequestAuthorizer {
  return (
    !!authorizer &&
    typeof authorizer === 'object' &&
    'principalId' in authorizer &&
    typeof authorizer.principalId === 'string' &&
    'session' in authorizer &&
    typeof authorizer.session === 'string'
  )
}
