import type { SESClientConfig } from '@aws-sdk/client-ses'

export const SES_OFFLINE_OPTIONS: SESClientConfig = {
  endpoint: 'http://localhost:8005',
  region: 'aws-ses-v2-local',
  credentials: {
    accessKeyId: 'any-access-key-id',
    secretAccessKey: 'any-secret-access-key',
  },
}
