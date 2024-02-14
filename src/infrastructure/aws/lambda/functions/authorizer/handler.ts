import type { APIGatewayTokenAuthorizerHandler } from 'aws-lambda'

import type { VerifyToken } from '@/domain/security/cryptography/verify-token'
import { TokenSecret } from '@/domain/security/protocols/token'
import { JsonWebTokenAdapter } from '@/infrastructure/cryptography/jsonwebtoken-adapter'

export const main: APIGatewayTokenAuthorizerHandler = async (event) => {
  // Extract access token from cookie in event headers
  const cookie = event.authorizationToken
  const accessToken = extractAccessTokenFromCookie(cookie)

  if (!accessToken) {
    throw new Error('Unauthorized')
  }

  // Validate access token
  const verifyToken: VerifyToken = new JsonWebTokenAdapter()
  const payload = await verifyToken.verify({
    token: accessToken,
    secret: TokenSecret.AccessToken,
  })

  // Return unauthorized if access token is invalid (expired, invalid signature, etc.)
  if (!payload) {
    throw new Error('Unauthorized')
  }

  // Generate policy document on success
  return generatePolicy(payload.sub, 'Allow', event.methodArn)
}

// TODO Handle multiple values in the cookie
function extractAccessTokenFromCookie(cookie: string) {
  // Shouldn't we parse the cookie? We can receive more than one value here. In fact, it'll also have a refresh token
  return cookie.split('=')[1]
}

function generatePolicy(principalId: string, effect: string, resource: string) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  }
}
