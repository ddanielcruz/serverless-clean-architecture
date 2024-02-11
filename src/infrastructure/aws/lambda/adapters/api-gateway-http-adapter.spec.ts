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
    headers: { 'Content-Type': 'application/json' },
    queryStringParameters: { 'any-query': 'any-value' },
  } as unknown as APIGatewayProxyEvent

  beforeEach(() => {
    controllerStub = new HttpControllerStub()
  })

  it('invokes controller with correct parameters', async () => {
    const handleSpy = vi.spyOn(controllerStub, 'handle')
    const handler = apiGatewayHttpAdapter(controllerStub)
    await handler(apiEvent, null as never, null as never)
    expect(handleSpy).toHaveBeenCalledWith({
      body: apiEvent.body,
      headers: apiEvent.headers,
      query: apiEvent.queryStringParameters,
    })
  })

  it('sets query to an empty map when no query parameters are provided', async () => {
    const handleSpy = vi.spyOn(controllerStub, 'handle')
    const handler = apiGatewayHttpAdapter(controllerStub)
    await handler(
      { ...apiEvent, queryStringParameters: null },
      null as never,
      null as never,
    )
    expect(handleSpy).toHaveBeenCalledWith({
      body: apiEvent.body,
      headers: apiEvent.headers,
      query: {},
    })
  })

  it('sanitizes undefined values on map properties', async () => {
    const handleSpy = vi.spyOn(controllerStub, 'handle')
    const handler = apiGatewayHttpAdapter(controllerStub)
    await handler(
      {
        ...apiEvent,
        headers: {
          ...apiEvent.headers,
          'X-Undefined-Header': undefined,
        },
        queryStringParameters: {
          ...apiEvent.queryStringParameters,
          'undefined-query': undefined,
        },
      },
      null as never,
      null as never,
    )
    expect(handleSpy).toHaveBeenCalledWith({
      body: apiEvent.body,
      headers: { 'Content-Type': 'application/json' },
      query: apiEvent.queryStringParameters,
    })
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
