import { EmailTemplate } from '@/domain/users/email/email-template'
import type { ValidatedEventAPIGatewayProxyEvent } from '@/infrastructure/aws/libs/api-gateway'
import { formatJSONResponse } from '@/infrastructure/aws/libs/api-gateway'
import { middyfy } from '@/infrastructure/aws/libs/lambda'

import type schema from './schema'
import { SESAdapter } from '../../ses/ses-adapter'

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event,
) => {
  const ses = new SESAdapter()
  await ses.send({
    to: ['daniel@example.com'],
    data: { url: 'any-url' },
    subject: 'Any Subject',
    template: EmailTemplate.EmailVerification,
  })

  return formatJSONResponse({
    message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    event,
  })
}

export const main = middyfy(hello)
