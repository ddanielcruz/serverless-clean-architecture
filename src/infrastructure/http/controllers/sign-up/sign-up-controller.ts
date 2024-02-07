import { z } from 'zod'

import type { SignUp } from '@/domain/users/services/sign-up'

import type {
  HttpRequest,
  HttpResponse,
  HttpController,
} from '../../protocols/http-controller'
import { conflict, noContent } from '../../utils/http-response'

export class SignUpController implements HttpController {
  private readonly serializer = z.object({
    name: z.string(),
    email: z.string().email(),
  })

  constructor(private readonly signUp: SignUp) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = this.serializer.parse(request.body)
    const result = await this.signUp.execute(body)

    if (result.isLeft()) {
      return conflict({ body: { message: result.value.message } })
    }

    return noContent()
  }
}
