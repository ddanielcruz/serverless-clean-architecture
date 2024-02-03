import middy from '@middy/core'
import middyJsonBodyParser from '@middy/http-json-body-parser'
import type { Handler } from 'aws-lambda'

// TODO Add core middleware
export const middyfy = (handler: Handler) => {
  return middy(handler).use(middyJsonBodyParser())
}
