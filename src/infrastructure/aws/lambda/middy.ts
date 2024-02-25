import middy, { type MiddlewareObj } from '@middy/core'
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop'
import httpCors from '@middy/http-cors'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpSecurityHeaders from '@middy/http-security-headers'
import type { Handler } from 'aws-lambda'

import { corsOptions } from '@/infrastructure/http/config/cors'

type EventSource = 'api-gateway' | 's3'

export const middyfy = (
  handler: Handler,
  source: EventSource = 'api-gateway',
) => {
  const middleware: MiddlewareObj[] = [doNotWaitForEmptyEventLoop()]

  if (source === 'api-gateway') {
    middleware.push(
      httpCors({
        credentials: corsOptions.credentials,
        headers: corsOptions.headers.join(', '),
        methods: corsOptions.methods.join(', '),
        origin: corsOptions.origin,
      }),
      httpJsonBodyParser() as MiddlewareObj,
      httpSecurityHeaders(),
    )
  }

  return middy(handler).use(middleware)
}
