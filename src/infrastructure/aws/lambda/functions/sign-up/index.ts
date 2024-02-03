import { handlerPath } from '@/infrastructure/aws/lambda/utils/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    EMAIL_SENDER: '${env:EMAIL_SENDER}',
    DATABASE_URL: '${env:DATABASE_URL}',
    CONFIRMATION_TOKEN_URL: '${env:CONFIRMATION_TOKEN_URL}',
  },
  events: [
    {
      http: {
        method: 'post',
        path: '/sign-up',
      },
    },
  ],
}
