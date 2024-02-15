import type { InvalidateSession } from '@/domain/security/services/invalidate-session'

import { sessionCookieOptions } from '../../config/cookie'
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../protocols/http-controller'
import { serializeCookie } from '../../utils/cookie'
import { noContent, notFound, unauthorized } from '../../utils/http-response'

export class SignOutController implements HttpController {
  constructor(private readonly invalidateSession: InvalidateSession) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    if (!request.session) {
      return unauthorized()
    }

    const { sessionId } = request.session
    const result = await this.invalidateSession.execute({ sessionId })

    if (result.isLeft()) {
      return notFound({ body: { message: result.value.message } })
    }

    // Create cookies to destroy them in the client
    const cookies = [
      this.createExpiredCookie('accessToken'),
      this.createExpiredCookie('refreshToken'),
    ]

    return noContent({ headers: { 'Set-Cookie': cookies } })
  }

  private createExpiredCookie(name: string) {
    return serializeCookie(name, '', {
      ...sessionCookieOptions,
      expires: new Date(0),
    })
  }
}
