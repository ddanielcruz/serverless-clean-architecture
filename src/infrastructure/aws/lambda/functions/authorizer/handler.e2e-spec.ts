import type { APIGatewayTokenAuthorizerEvent } from 'aws-lambda'

import type { TokenPayload } from '@/domain/security/protocols/token'
import { TokenSecret } from '@/domain/security/protocols/token'
import { JsonWebTokenAdapter } from '@/infrastructure/cryptography/jsonwebtoken-adapter'

import { main as sut } from './handler'

function makeEvent(cookie: string): APIGatewayTokenAuthorizerEvent {
  return {
    authorizationToken: cookie,
    methodArn: 'any-method-arn',
    type: 'TOKEN',
  }
}

describe('Authorizer', () => {
  const jwtAdapter = new JsonWebTokenAdapter()
  const tokenPayload: TokenPayload = {
    sub: 'any-subject',
    session: 'any-session',
  }
  let accessToken: string

  beforeAll(async () => {
    const token = await jwtAdapter.sign({
      payload: tokenPayload,
      secret: TokenSecret.AccessToken,
    })
    accessToken = token.value
  })

  it.each(['', 'any=cookie'])(
    'returns unauthorized if cookie is not provided: %j',
    async (cookie) => {
      const response = await sut(makeEvent(cookie))
      expect(response).toEqual('Unauthorized')
    },
  )

  it('returns unauthorized if token is invalid', async () => {
    const response = await sut(makeEvent('accessToken=invalid-token'))
    expect(response).toEqual('Unauthorized')
  })

  it('returns a policy object if token is valid', async () => {
    const response = await sut(makeEvent(`accessToken=${accessToken}`))
    expect(response).toEqual({
      principalId: tokenPayload.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: 'any-method-arn',
          },
        ],
      },
    })
  })
})
