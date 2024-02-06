import type { APIGatewayProxyEvent } from 'aws-lambda'

import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '@/infrastructure/http/protocols/http-controller'

import { apiGatewayHttpAdapter } from './api-gateway-http-adapter'

class HttpControllerStub implements HttpController {
  async handle({ body }: HttpRequest): Promise<HttpResponse> {
    return { statusCode: 200, body }
  }
}

describe('apiGatewayHttpAdapter', () => {
  let controllerStub: HttpController
  const apiEvent = {
    body: { name: 'any-name' },
  } as unknown as APIGatewayProxyEvent

  beforeEach(() => {
    controllerStub = new HttpControllerStub()
  })

  it('adapts the controller response to API gateway format', async () => {
    const handler = apiGatewayHttpAdapter(controllerStub)
    const response = await handler(apiEvent, null as never, null as never)
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify(apiEvent.body),
    })
  })

  it('returns an empty body on 204 response', async () => {
    vi.spyOn(controllerStub, 'handle').mockResolvedValueOnce({
      statusCode: 204,
    })
    const handler = apiGatewayHttpAdapter(controllerStub)
    const response = await handler(apiEvent, null as never, null as never)
    expect(response).toEqual({
      statusCode: 204,
      body: '',
    })
  })

  it('throws if controller throws', async () => {
    const error = new Error('mocked-error')
    vi.spyOn(controllerStub, 'handle').mockRejectedValueOnce(error)
    const handler = apiGatewayHttpAdapter(controllerStub)
    const promise = handler(apiEvent, null as never, null as never)
    await expect(promise).rejects.toThrow(error)
  })
})
