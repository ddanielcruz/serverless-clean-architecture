import { z } from 'zod'

import type { LogMessage, Logger } from '@/core/protocols/logger'
import { LoggerStub } from '@/test/stubs/logger-stub'

import { ErrorHandlerMiddleware } from './error-handler-middleware'
import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../protocols/http-controller'

class StubHttpController implements HttpController {
  private readonly serializer = z.object({ name: z.string() })

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = this.serializer.parse(request.body)
    return { statusCode: 200, body }
  }
}

describe('ErrorHandlerMiddleware', () => {
  let sut: ErrorHandlerMiddleware
  let controllerStub: StubHttpController
  let loggerStub: Logger

  const httpRequest: HttpRequest = {
    body: { name: 'any-name' },
    headers: {},
    query: {},
    ipAddress: 'any-ip',
    session: null,
  }

  beforeEach(() => {
    controllerStub = new StubHttpController()
    loggerStub = new LoggerStub()
    sut = new ErrorHandlerMiddleware(controllerStub, loggerStub)
  })

  it('returns 400 on Zod errors', async () => {
    const response = await sut.handle({ ...httpRequest, body: {} })
    expect(response.statusCode).toBe(400)
    expect(response.body).toMatchObject({
      message: expect.any(String),
      issues: expect.any(Array),
    })
  })

  it('returns 500 on unknown errors', async () => {
    const logError = vi
      .spyOn(loggerStub, 'error')
      .mockImplementationOnce(() => {})
    const error = new Error('unknown-error')
    vi.spyOn(controllerStub, 'handle').mockRejectedValueOnce(error)
    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(500)
    expect(response.body).toMatchObject({ message: expect.any(String) })
    expect(response.body).not.toMatchObject({ message: error.message })
    expect(logError).toHaveBeenCalledWith(error)
  })

  it('returns controller response on success', async () => {
    const response = await sut.handle(httpRequest)
    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({ name: 'any-name' })
  })
})
