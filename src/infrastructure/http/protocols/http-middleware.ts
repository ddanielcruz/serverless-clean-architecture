import { HttpController } from './http-controller'

export abstract class HttpMiddleware extends HttpController {
  constructor(protected readonly controller: HttpController) {
    super()
  }
}
