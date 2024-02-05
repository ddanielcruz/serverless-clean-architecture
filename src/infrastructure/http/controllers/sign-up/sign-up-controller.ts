import { z } from 'zod'

import type { SignUp } from '@/domain/users/services/sign-up'

import {
  type HttpRequest,
  type HttpResponse,
  type HttpController,
  HttpCode,
} from '../../protocols/http-controller'

export class SignUpController implements HttpController {
  private readonly serializer = z.object({
    name: z.string(),
    email: z.string().email(),
  })

  constructor(private readonly signUp: SignUp) {}

  // TODO Handle Zod error
  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = this.serializer.parse(request.body)
    const result = await this.signUp.execute(body)

    if (result.isLeft()) {
      return {
        statusCode: HttpCode.CONFLICT,
        body: { message: result.value.message },
      }
    }

    return { statusCode: HttpCode.NO_CONTENT }
  }
}
