import { ZodError } from 'zod'

import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { SignIn } from '@/domain/users/services/sign-in'

import { SignInController } from './sign-in-controller'
import type { HttpRequest } from '../../protocols/http-controller'

describe('SignInController', () => {
  let sut: SignInController
  let signInStub: SignIn
  const httpRequest = {
    body: { email: 'daniel@example.com' },
    headers: {},
    query: {},
    ipAddress: '127.0.0.1',
    session: null,
  } satisfies HttpRequest

  beforeEach(() => {
    signInStub = {
      execute: vi.fn().mockResolvedValue(right(null)),
    } as unknown as SignIn
    sut = new SignInController(signInStub)
  })

  it.each([{ email: null }, { email: 'invalid-email' }])(
    'throws if request body is invalid: %o',
    async (override) => {
      const body = Object.assign({}, httpRequest.body, override)
      const promise = sut.handle({ ...httpRequest, body })

      await expect(promise).rejects.toThrow(ZodError)
    },
  )

  it('returns 404 on resource not found', async () => {
    const error = new ResourceNotFoundError()
    vi.spyOn(signInStub, 'execute').mockResolvedValueOnce(left(error))

    const response = await sut.handle(httpRequest)

    expect(response).toEqual({
      statusCode: 404,
      body: { message: error.message },
    })
  })

  it('returns 204 on success', async () => {
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({ statusCode: 204 })
  })
})
