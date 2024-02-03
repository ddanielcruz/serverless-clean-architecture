import type { APIGatewayProxyHandler } from 'aws-lambda'

import { makeSignUpController } from '@/infrastructure/http/controllers/sign-up-controller-factory'

import { middyfy } from '../../middy'

const handler: APIGatewayProxyHandler = async (event) => {
  const controller = makeSignUpController()
  const response = await controller.handle({ body: event.body })

  return {
    statusCode: response.statusCode,
    // TODO Return empty body if response.body is undefined
    body: response.body ? JSON.stringify(response.body) : '',
  }
}

export const main = middyfy(handler)
