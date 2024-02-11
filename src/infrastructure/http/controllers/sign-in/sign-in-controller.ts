import { z } from 'zod'

import type { SignIn } from '@/domain/users/services/sign-in'

import type {
  HttpRequest,
  HttpResponse,
  HttpController,
} from '../../protocols/http-controller'
import { noContent, notFound } from '../../utils/http-response'

export class SignInController implements HttpController {
  private readonly serializer = z.object({ email: z.string().email() })

  constructor(private readonly signIn: SignIn) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = this.serializer.parse(request.body)
    const result = await this.signIn.execute(body)

    if (result.isLeft()) {
      return notFound({ body: { message: result.value.message } })
    }

    return noContent()
  }
}
