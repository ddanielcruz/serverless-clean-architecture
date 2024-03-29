import type {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from 'aws-lambda'

import type { VerifyToken } from '@/domain/security/cryptography/verify-token'
import { TokenSecret } from '@/domain/security/protocols/token'
import { JsonWebTokenAdapter } from '@/infrastructure/cryptography/jsonwebtoken-adapter'

// Custom handler because the official one is incorrect
type Handler = (
  event: APIGatewayTokenAuthorizerEvent,
) => Promise<APIGatewayAuthorizerResult | 'Unauthorized'>

export const main: Handler = async (event) => {
  // Extract access token from cookie in event headers
  const cookie = event.authorizationToken
  const accessToken = extractAccessTokenFromCookie(cookie)

  if (!accessToken) {
    return 'Unauthorized'
  }

  // Validate access token
  const verifyToken: VerifyToken = new JsonWebTokenAdapter()
  const payload = await verifyToken.verify({
    token: accessToken,
    secret: TokenSecret.AccessToken,
  })

  // Return unauthorized if access token is invalid (expired, invalid signature, etc.)
  if (!payload) {
    return 'Unauthorized'
  }

  // Generate policy document on success
  return generatePolicy({
    principalId: payload.sub,
    effect: 'Allow',
    resource: event.methodArn,
    context: {
      session: payload.session,
    },
  })
}

function extractAccessTokenFromCookie(cookieList: string) {
  const accessToken = cookieList.split(';').find((cookie) => {
    return cookie.trim().startsWith('accessToken')
  })

  if (!accessToken) {
    return null
  }

  return accessToken.split('=')[1]
}

interface GeneratePolicyParams {
  principalId: string
  effect: 'Allow' | 'Deny'
  resource: string
  context: {
    session: string
  }
}

function generatePolicy({
  principalId,
  effect,
  resource,
  context,
}: GeneratePolicyParams) {
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
    context,
  }
}
