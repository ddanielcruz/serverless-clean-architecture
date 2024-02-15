import type { APIGatewayProxyEvent } from 'aws-lambda'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
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
    headers: { 'content-type': 'application/json' },
    queryStringParameters: { 'any-query': 'any-value' },
    requestContext: {
      identity: {
        sourceIp: '127.0.0.1',
      },
    },
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
      ipAddress: apiEvent.requestContext.identity.sourceIp,
      session: null,
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
      ipAddress: apiEvent.requestContext.identity.sourceIp,
      session: null,
    })
  })

  it('removes falsy headers and normalize header keys', async () => {
    const handleSpy = vi.spyOn(controllerStub, 'handle')
    const handler = apiGatewayHttpAdapter(controllerStub)
    await handler(
      {
        ...apiEvent,
        headers: {
          ...apiEvent.headers,
          'X-Undefined-Header': undefined,
          'X-Uppercase-Header': 'true',
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
      headers: {
        'content-type': 'application/json',
        'x-uppercase-header': 'true',
      },
      query: apiEvent.queryStringParameters,
      ipAddress: apiEvent.requestContext.identity.sourceIp,
      session: null,
    })
  })

  it('adapts the controller response to API gateway format', async () => {
    const handler = apiGatewayHttpAdapter(controllerStub)
    const response = await handler(apiEvent, null as never, null as never)
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify(apiEvent.body),
      multiValueHeaders: {},
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
      multiValueHeaders: {},
    })
  })

  it('normalizes response headers to multiValueHeaders format', async () => {
    vi.spyOn(controllerStub, 'handle').mockResolvedValueOnce({
      statusCode: 204,
      headers: {
        'set-cookie': ['cookie1', 'cookie2'],
        'x-custom-header': 'custom-header',
      },
    })

    const handler = apiGatewayHttpAdapter(controllerStub)
    const response = await handler(apiEvent, null as never, null as never)

    expect(response).toMatchObject({
      multiValueHeaders: {
        'set-cookie': ['cookie1', 'cookie2'],
        'x-custom-header': ['custom-header'],
      },
    })
  })

  it('throws if controller throws', async () => {
    const error = new Error('mocked-error')
    vi.spyOn(controllerStub, 'handle').mockRejectedValueOnce(error)
    const handler = apiGatewayHttpAdapter(controllerStub)
    const promise = handler(apiEvent, null as never, null as never)
    await expect(promise).rejects.toThrow(error)
  })

  it('parses session from request context authorizer', async () => {
    const handleSpy = vi.spyOn(controllerStub, 'handle')
    const handler = apiGatewayHttpAdapter(controllerStub)
    await handler(
      {
        ...apiEvent,
        requestContext: {
          ...apiEvent.requestContext,
          authorizer: {
            principalId: 'any-principal-id',
            session: 'any-session-id',
          },
        },
      },
      null as never,
      null as never,
    )
    expect(handleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        session: {
          sessionId: new UniqueEntityId('any-session-id'),
          userId: new UniqueEntityId('any-principal-id'),
        },
      }),
    )
  })
})
