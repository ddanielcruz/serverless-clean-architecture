import { ZodError } from 'zod'

import { left, right } from '@/core/either'
import { UserAlreadyExistsError } from '@/domain/users/services/errors/user-already-exists-error'
import type { SignUp } from '@/domain/users/services/sign-up'

import { SignUpController } from './sign-up-controller'
import type { HttpRequest } from '../../protocols/http-controller'

describe('SignUpController', () => {
  let sut: SignUpController
  let signUpStub: SignUp
  const httpRequest = {
    body: {
      name: 'Daniel',
      email: 'daniel@example.com',
    },
    headers: {},
    query: {},
  } satisfies HttpRequest

  beforeEach(() => {
    signUpStub = {
      execute: vi.fn().mockResolvedValue(right(null)),
    } as unknown as SignUp
    sut = new SignUpController(signUpStub)
  })

  it.each([{ name: null }, { email: null }, { email: 'invalid-email' }])(
    'throws if request body is invalid: %o',
    async (override) => {
      const body = Object.assign({}, httpRequest.body, override)
      const promise = sut.handle({ ...httpRequest, body })

      await expect(promise).rejects.toThrow(ZodError)
    },
  )

  it('returns 409 on user already exists', async () => {
    const error = new UserAlreadyExistsError(httpRequest.body.email)
    vi.spyOn(signUpStub, 'execute').mockResolvedValueOnce(left(error))

    const response = await sut.handle(httpRequest)

    expect(response).toEqual({
      statusCode: 409,
      body: {
        message: error.message,
      },
    })
  })

  it('returns 204 on success', async () => {
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({ statusCode: 204 })
  })
})
