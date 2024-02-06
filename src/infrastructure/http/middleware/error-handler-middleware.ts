import { ZodError } from 'zod'

import type { Logger } from '@/core/protocols/logger'

import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../protocols/http-controller'
import { HttpMiddleware } from '../protocols/http-middleware'

export class ErrorHandlerMiddleware extends HttpMiddleware {
  constructor(
    controller: HttpController,
    private readonly logger: Logger,
  ) {
    super(controller)
  }

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

      this.logger.error(error as Error)
      return {
        statusCode: 500,
        body: { message: 'Internal server error.' },
      }
    }
  }
}
