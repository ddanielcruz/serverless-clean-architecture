import { ZodError } from 'zod'

import type { HttpRequest, HttpResponse } from '../protocols/http-controller'
import { HttpMiddleware } from '../protocols/http-middleware'

export class ErrorHandlerMiddleware extends HttpMiddleware {
  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      return await this.controller.handle(request)
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          statusCode: 400,
          body: {
            message: 'Validation failed.',
            issues: error.issues,
          },
        }
      }

      // TODO Log with logger service
      console.error(error)
      return {
        statusCode: 500,
        body: { message: 'Internal server error.' },
      }
    }
  }
}
