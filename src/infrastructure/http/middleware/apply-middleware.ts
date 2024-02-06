import { LambdaLoggerAdapter } from '@/infrastructure/aws/lambda/adapters/lambda-logger-adapter'

import { ErrorHandlerMiddleware } from './error-handler-middleware'
import type { HttpController } from '../protocols/http-controller'
import type { HttpMiddleware } from '../protocols/http-middleware'

type HttpMiddlewareConstructor = new (
  controller: HttpController,
) => HttpMiddleware

const middleware: HttpMiddlewareConstructor[] = []

/**
 * Apply common middleware to the controller.
 *
 * @param controller Controller to apply middleware to.
 * @returns Controller with middleware applied.
 */
export function applyMiddleware(controller: HttpController): HttpController {
  const lambdaLogger = new LambdaLoggerAdapter()
  const controllerWithMiddleware = middleware.reduce(
    (acc, Middleware) => new Middleware(acc),
    controller,
  )

  return new ErrorHandlerMiddleware(controllerWithMiddleware, lambdaLogger)
}
