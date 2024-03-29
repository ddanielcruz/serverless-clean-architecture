import { handlerPath } from '../../utils/handler-resolver'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    ACCESS_TOKEN_SECRET: '${env:ACCESS_TOKEN_SECRET}',
    ACCESS_TOKEN_EXPIRATION: '${env:ACCESS_TOKEN_EXPIRATION}',
    REFRESH_TOKEN_SECRET: '${env:REFRESH_TOKEN_SECRET}',
    REFRESH_TOKEN_EXPIRATION: '${env:REFRESH_TOKEN_EXPIRATION}',
  },
}
