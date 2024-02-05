import middy, { type MiddlewareObj } from '@middy/core'
import doNotWaitForEmptyEventLoop from '@middy/do-not-wait-for-empty-event-loop'
import httpCors from '@middy/http-cors'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpSecurityHeaders from '@middy/http-security-headers'
import sqsBatchFailure from '@middy/sqs-partial-batch-failure'
import type { Handler } from 'aws-lambda'

type EventSource = 'api-gateway' | 'sqs'

export const middyfy = (
  handler: Handler,
  source: EventSource = 'api-gateway',
) => {
  const middleware: MiddlewareObj[] = [doNotWaitForEmptyEventLoop()]

  if (source === 'api-gateway') {
    middleware.push(
      httpCors(),
      httpJsonBodyParser() as MiddlewareObj,
      httpSecurityHeaders(),
    )
  }

  if (source === 'sqs') {
    middleware.push(sqsBatchFailure())
  }

  return middy(handler).use(middleware)
}
