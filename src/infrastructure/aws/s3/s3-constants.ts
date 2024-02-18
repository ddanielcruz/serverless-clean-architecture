import type { S3ClientConfig } from '@aws-sdk/client-s3'

import { config } from '@/core/config'

export const S3_OFFLINE_OPTIONS: S3ClientConfig = {
  endpoint: 'http://0.0.0.0:9000',
  forcePathStyle: true,
  region: config.get('AWS_REGION'),
  credentials: {
    accessKeyId: 'development',
    secretAccessKey: 'development',
  },
}
