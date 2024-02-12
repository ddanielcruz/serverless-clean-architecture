import * as jwt from 'jsonwebtoken'

import { config } from '@/core/config'
import type { TokenPayload } from '@/domain/security/protocols/token'
import { TokenSecret } from '@/domain/security/protocols/token'

import { JsonWebTokenAdapter } from './jsonwebtoken-adapter'

vi.mock('jsonwebtoken', async () => {
  const actual = (await vi.importActual('jsonwebtoken')) as {
    default: typeof jwt
  }

  return {
    ...actual.default,
    sign: vi.fn().mockImplementation(actual.default.sign),
    verify: vi.fn().mockImplementation(actual.default.verify),
  }
})

describe('JsonWebTokenAdapter', () => {
  let sut: JsonWebTokenAdapter
  const tokenPayload: TokenPayload = { sub: 'any-id', session: 'any-session' }

  beforeAll(() => {
    process.env.ACCESS_TOKEN_EXPIRATION = '5m'
  })

  beforeEach(() => {
    sut = new JsonWebTokenAdapter()
  })

  describe('signToken', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it.each([TokenSecret.AccessToken, TokenSecret.RefreshToken])(
      'signs a valid token: %s',
      async (secret) => {
        const token = await sut.sign({ payload: tokenPayload, secret })
        const { secret: secretValue } = getParameters(secret)
        const decoded = jwt.verify(token.value, secretValue) as { sub: string }

        expect(token).toBeDefined()
        expect(decoded).toMatchObject(tokenPayload)
      },
    )

    it('calls sign with correct parameters', async () => {
      const signSpy = vi.spyOn(jwt, 'sign')
      const { secret, expiration } = getParameters(TokenSecret.AccessToken)
      await sut.sign({ payload: tokenPayload, secret: TokenSecret.AccessToken })
      expect(signSpy).toHaveBeenCalledWith(tokenPayload, secret, {
        expiresIn: expiration,
      })
    })

    it('returns the correct expiration date', async () => {
      const now = new Date(2024, 0, 1)
      vi.setSystemTime(now)
      const token = await sut.sign({
        payload: tokenPayload,
        secret: TokenSecret.AccessToken,
      })
      expect(token.expiresAt).toEqual(new Date(now.getTime() + 5 * 60 * 1000))
    })
  })

  describe('verify', () => {
    let validToken: string

    beforeAll(() => {
      const { secret, expiration } = getParameters(TokenSecret.AccessToken)
      validToken = jwt.sign(tokenPayload, secret, { expiresIn: expiration })
    })

    it('returns null on invalid token', async () => {
      const result = await sut.verify({
        token: 'invalid-token',
        secret: TokenSecret.AccessToken,
      })
      expect(result).toBeNull()
    })

    it('returns null on valid token but different secrent', async () => {
      const result = await sut.verify({
        token: validToken,
        secret: TokenSecret.RefreshToken,
      })
      expect(result).toBeNull()
    })

    it('returns null on expired token', async () => {
      const { secret } = getParameters(TokenSecret.AccessToken)
      const expiredToken = jwt.sign(tokenPayload, secret, { expiresIn: '0s' })
      const result = await sut.verify({
        token: expiredToken,
        secret: TokenSecret.AccessToken,
      })
      expect(result).toBeNull()
    })

    it('returns token payload on success', async () => {
      const result = await sut.verify({
        token: validToken,
        secret: TokenSecret.AccessToken,
      })

      expect(result).toMatchObject(tokenPayload)
    })
  })
})

function getParameters(secret: TokenSecret): {
  secret: string
  expiration: string
} {
  switch (secret) {
    case TokenSecret.AccessToken:
      return {
        secret: config.get('ACCESS_TOKEN_SECRET'),
        expiration: config.get('ACCESS_TOKEN_EXPIRATION'),
      }
    case TokenSecret.RefreshToken:
      return {
        secret: config.get('REFRESH_TOKEN_SECRET'),
        expiration: config.get('REFRESH_TOKEN_EXPIRATION'),
      }
  }
}
