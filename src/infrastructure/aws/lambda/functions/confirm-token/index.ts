import { handlerPath } from '@/infrastructure/aws/lambda/utils/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    ACCESS_TOKEN_SECRET: '${env:ACCESS_TOKEN_SECRET}',
    ACCESS_TOKEN_EXPIRATION: '${env:ACCESS_TOKEN_EXPIRATION}',
    REFRESH_TOKEN_SECRET: '${env:REFRESH_TOKEN_SECRET}',
    REFRESH_TOKEN_EXPIRATION: '${env:REFRESH_TOKEN_EXPIRATION}',
    COOKIE_DOMAIN: '${env:COOKIE_DOMAIN}',
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
