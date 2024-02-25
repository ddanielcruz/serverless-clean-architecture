import { AudioFormat } from '@/domain/notes/entities/audio'
import { handlerPath } from '@/infrastructure/aws/lambda/utils/handler-resolver'

import { defineFunction } from '../../utils/define-function'

const supportedFormats = Object.keys(AudioFormat).map(
  (key) => AudioFormat[key as keyof typeof AudioFormat],
)

export default defineFunction({
  handler: `${handlerPath(__dirname)}/handler.main`,
  iamRoleStatements: [
    {
      Effect: 'Allow',
      Action: ['transcribe:StartTranscriptionJob'],
      Resource: '*',
    },
  ],
  events: supportedFormats.map((format) => ({
    s3: {
      bucket: '${env:S3_BUCKET_NAME}',
      event: 's3:ObjectCreated:*',
      rules: [
        {
          prefix: `uploads/`,
          suffix: `.${format}`,
        },
      ],
    },
  })),
})
