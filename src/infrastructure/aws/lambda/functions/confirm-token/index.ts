import { handlerPath } from '@/infrastructure/aws/lambda/utils/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    DATABASE_URL: '${env:DATABASE_URL}',
    CONFIRMATION_TOKEN_URL: '${env:CONFIRMATION_TOKEN_URL}',
    ACCESS_TOKEN_SECRET: '${env:ACCESS_TOKEN_SECRET}',
    REFRESH_TOKEN_SECRET: '${env:REFRESH_TOKEN_SECRET}',
  },
  events: [
    {
      http: {
        method: 'post',
        path: '/confirm-token',
      },
    },
  ],
}
