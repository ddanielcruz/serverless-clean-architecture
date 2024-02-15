import type { Session } from '@/domain/security/entities/session'
import { UnidentifiedSessionError } from '@/domain/security/services/errors/unidentified-session-error'
import type { RefreshSession } from '@/domain/security/services/refresh-session'

import { sessionCookieOptions } from '../../config/cookie'
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../protocols/http-controller'
import { serializeCookie } from '../../utils/cookie'
import { badRequest, noContent, unauthorized } from '../../utils/http-response'

export class RefreshSessionController implements HttpController {
  constructor(private readonly refreshToken: RefreshSession) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const cookie = request.headers.cookie || ''
    const refreshToken = this.extractRefreshTokenFromCookie(cookie)

    // No refresh token provided
    if (!refreshToken) {
      return unauthorized()
    }

    const response = await this.refreshToken.execute({
      refreshToken,
      ipAddress: request.ipAddress,
      userAgent: request.headers['user-agent'] || 'unknown',
    })

    // Successfully refreshed session
    if (response.isRight()) {
      const { session } = response.value
      return noContent({
        headers: {
          'Set-Cookie': this.serializeSessionCookies(session),
        },
      })
    }

    // Unable to locate IP address
    if (response.value instanceof UnidentifiedSessionError) {
      return badRequest({ body: { message: response.value.message } })
    }

    return unauthorized()
  }

  private extractRefreshTokenFromCookie(cookie: string): string | null {
    const match = cookie.match(/refreshToken=(.*?)(;|$)/)
    return match ? match[1] : null
  }

  private serializeSessionCookies(session: Session): string[] {
    return [
      serializeCookie(
        'accessToken',
        session.accessToken.value,
        sessionCookieOptions,
      ),
      serializeCookie(
        'refreshToken',
        session.refreshToken.value,
        sessionCookieOptions,
      ),
    ]
  }
}
