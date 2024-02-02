import { handlerPath } from '@/infrastructure/aws/libs/handler-resolver'

import schema from './schema'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    EMAIL_SENDER: '${env:EMAIL_SENDER}',
  },
  events: [
    {
      http: {
        method: 'post',
        path: 'hello',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
}
