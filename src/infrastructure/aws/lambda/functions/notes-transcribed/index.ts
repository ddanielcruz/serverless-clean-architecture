import { handlerPath } from '@/infrastructure/aws/lambda/utils/handler-resolver'

import { defineFunction } from '../../utils/define-function'

export default defineFunction({
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    S3_BUCKET_NAME: '${env:S3_BUCKET_NAME}',
    S3_URL_EXPIRATION: '${env:S3_URL_EXPIRATION, "120"}',
  },
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['s3:GetObject'],
      Resource: [
        'arn:aws:s3:::${env:S3_BUCKET_NAME}',
        'arn:aws:s3:::${env:S3_BUCKET_NAME}/*',
      ],
    },
  ],
  events: [
    {
      s3: {
        bucket: '${env:S3_BUCKET_NAME}',
        event: 's3:ObjectCreated:*',
        rules: [{ prefix: `transcriptions/` }],
      },
    },
  ],
})
