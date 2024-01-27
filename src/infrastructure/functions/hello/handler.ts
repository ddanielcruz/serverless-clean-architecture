import type { ValidatedEventAPIGatewayProxyEvent } from '@/infrastructure/libs/api-gateway'
import { formatJSONResponse } from '@/infrastructure/libs/api-gateway'
import { middyfy } from '@/infrastructure/libs/lambda'

import type schema from './schema'

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event,
) => {
  return formatJSONResponse({
    message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    event,
  })
}

export const main = middyfy(hello)
