import { ErrorHandlerMiddleware } from './error-handler-middleware'
import type { HttpController } from '../protocols/http-controller'
import type { HttpMiddleware } from '../protocols/http-middleware'

type HttpMiddlewareConstructor = new (
  controller: HttpController,
) => HttpMiddleware

const middleware: HttpMiddlewareConstructor[] = [ErrorHandlerMiddleware]

/**
 * Apply common middleware to the controller.
 *
 * @param controller Controller to apply middleware to.
 * @returns Controller with middleware applied.
 */
export function applyMiddleware(controller: HttpController): HttpController {
  return middleware.reduce((acc, Middleware) => {
    return new Middleware(acc)
  }, controller)
}
