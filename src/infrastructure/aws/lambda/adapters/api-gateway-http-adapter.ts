import type { APIGatewayProxyHandler } from 'aws-lambda'

import type {
  HttpController,
  HttpRequest,
} from '@/infrastructure/http/protocols/http-controller'

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
