import { z } from 'zod'

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Session } from '@/domain/security/services/create-session'
import type { ConfirmToken } from '@/domain/users/services/confirm-token'
import { TokenAlreadyUsedError } from '@/domain/users/services/errors/token-already-used-error'

import { sessionCookieOptions } from '../../config/cookie'
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../protocols/http-controller'
import { serializeCookie } from '../../utils/cookie'
import {
  badRequest,
  conflict,
  noContent,
  notFound,
} from '../../utils/http-response'

export class ConfirmTokenController implements HttpController {
  private readonly serializer = z.object({
    token: z.string(),
  })

  constructor(private readonly confirmToken: ConfirmToken) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = this.serializer.parse(request.body)
    const response = await this.confirmToken.execute({ token: body.token })

    if (response.isRight()) {
      const cookies = this.serializeCookies(response.value.session)
      return noContent({ headers: { 'Set-Cookie': cookies.join(', ') } })
    }

    const error = response.value
    if (error instanceof ResourceNotFoundError) {
      return notFound({ body: { message: error.message } })
    }

    if (error instanceof TokenAlreadyUsedError) {
      return conflict({ body: { message: error.message } })
    }

    return badRequest({ body: { message: error.message } })
  }

  private serializeCookies({ accessToken, refreshToken }: Session) {
    const serializedAccessToken = serializeCookie(
      'accessToken',
      accessToken,
      sessionCookieOptions,
    )

    const serializedRefreshToken = serializeCookie(
      'refreshToken',
      refreshToken,
      sessionCookieOptions,
    )

    return [serializedAccessToken, serializedRefreshToken]
  }
}