import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { CreateSession } from './create-session'
import type { SignToken, SignTokenParams } from '../cryptography/sign-token'
import { Token } from '../entities/value-objects/token'
import { TokenSecret } from '../protocols/token'

describe('CreateSession', () => {
  let sut: CreateSession
  let signToken: SignToken

  beforeEach(() => {
    signToken = {
      sign: vi.fn().mockImplementation((params: SignTokenParams) => {
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 1)

        return new Token({ value: `any-${params.secret}`, expiresAt })
      }),
    }
    sut = new CreateSession(signToken)
  })

  it('creates a new access token and refresh token pair', async () => {
    const userId = new UniqueEntityId()
    const signSpy = vi.spyOn(signToken, 'sign')

    const response = await sut.execute({ userId })

    expect(response.isRight()).toEqual(true)
    expect(response.value).toEqual({
      session: {
        accessToken: `any-${TokenSecret.AccessToken}`,
        refreshToken: `any-${TokenSecret.RefreshToken}`,
      },
    })
    expect(signSpy).toHaveBeenCalledWith({
      payload: { sub: userId.toString() },
      secret: 'access-token',
    })
    expect(signSpy).toHaveBeenCalledWith({
      payload: { sub: userId.toString() },
      secret: 'refresh-token',
    })
  })
})
