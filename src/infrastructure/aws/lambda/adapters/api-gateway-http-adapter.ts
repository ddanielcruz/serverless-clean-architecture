import type { APIGatewayProxyHandler } from 'aws-lambda'

import type {
  HttpController,
  HttpRequest,
} from '@/infrastructure/http/protocols/http-controller'

export function apiGatewayHttpAdapter(
  controller: HttpController,
): APIGatewayProxyHandler {
  return async (event) => {
    const request: HttpRequest = { body: event.body }
    const response = await controller.handle(request)

    return {
      statusCode: response.statusCode,
      body: response.body ? JSON.stringify(response.body) : '',
    }
  }
}
