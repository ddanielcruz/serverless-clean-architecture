import { handlerPath } from '@/infrastructure/aws/lambda/utils/handler-resolver'

import { defineFunction } from '../../utils/define-function'

export default defineFunction({
  handler: `${handlerPath(__dirname)}/handler.main`,
  protected: true,
  environment: {
    S3_BUCKET_NAME: '${self:custom.bucketName}',
    S3_URL_EXPIRATION: '${env:S3_URL_EXPIRATION, "120"}',
  },
  events: [
    {
      http: {
        method: 'post',
        path: '/notes',
      },
    },
  ],
})
