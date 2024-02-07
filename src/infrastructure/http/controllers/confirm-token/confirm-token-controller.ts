import { z } from 'zod'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { ConfirmToken } from '@/domain/users/services/confirm-token'
import { TokenAlreadyUsedError } from '@/domain/users/services/errors/token-already-used-error'

import {
  HttpCode,
  type HttpController,
  type HttpRequest,
  type HttpResponse,
} from '../../protocols/http-controller'

export class ConfirmTokenController implements HttpController {
  private readonly serializer = z.object({
    token: z.string(),
  })

  constructor(private readonly confirmToken: ConfirmToken) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = this.serializer.parse(request.body)
    const response = await this.confirmToken.execute({ token: body.token })

    if (response.isRight()) {
      return { statusCode: HttpCode.OK, body: response.value }
    }

    const error = response.value
    if (error instanceof ResourceNotFoundError) {
      return {
        statusCode: HttpCode.NOT_FOUND,
        body: { message: error.message },
      }
    }

    if (error instanceof TokenAlreadyUsedError) {
      return {
        statusCode: HttpCode.CONFLICT,
        body: { message: error.message },
      }
    }

    return {
      statusCode: HttpCode.BAD_REQUEST,
      body: { message: error.message },
    }
  }
}
