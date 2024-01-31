import * as jwt from 'jsonwebtoken'

import { config } from '@/core/config'
import type { SignTokenSecret } from '@/domain/security/cryptography/sign-token'

import { JsonWebTokenAdapter } from './jsonwebtoken-adapter'

vi.mock('jsonwebtoken', async () => {
  const actual = (await vi.importActual('jsonwebtoken')) as {
    default: typeof jwt
  }

  return {
    ...actual.default,
    sign: vi.fn().mockImplementation(actual.default.sign),
  }
})

describe('JsonWebTokenAdapter', () => {
  let sut: JsonWebTokenAdapter

  beforeEach(() => {
    sut = new JsonWebTokenAdapter()
  })

  describe('signToken', () => {
    it.each(['access-token', 'refresh-token'] as SignTokenSecret[])(
      'signs a valid token: %s',
      async (secret) => {
        const payload = { sub: 'any-id' }
        const token = await sut.sign({ payload, secret })
        const { secret: secretValue } = getParameters(secret)
        const decoded = jwt.verify(token, secretValue) as { sub: string }

        expect(token).toBeDefined()
        expect(decoded).toMatchObject(payload)
      },
    )

    it('calls sign with correct parameters', async () => {
      const signSpy = vi.spyOn(jwt, 'sign')
      const payload = { sub: 'any-id' }
      const { secret, expiration } = getParameters('access-token')
      await sut.sign({ payload, secret: 'access-token' })
      expect(signSpy).toHaveBeenCalledWith(payload, secret, {
        expiresIn: expiration,
      })
    })
  })
})

function getParameters(secret: SignTokenSecret): {
  secret: string
  expiration: string
} {
  switch (secret) {
    case 'access-token':
      return {
        secret: config.get('ACCESS_TOKEN_SECRET'),
        expiration: config.get('ACCESS_TOKEN_EXPIRATION'),
      }
    case 'refresh-token':
      return {
        secret: config.get('REFRESH_TOKEN_SECRET'),
        expiration: config.get('REFRESH_TOKEN_EXPIRATION'),
      }
  }
}
