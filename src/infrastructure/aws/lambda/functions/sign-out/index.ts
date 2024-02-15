import { handlerPath } from '@/infrastructure/aws/lambda/utils/handler-resolver'

import { defineFunction } from '../../utils/define-function'

export default defineFunction({
  handler: `${handlerPath(__dirname)}/handler.main`,
  protected: true,
  environment: {
    COOKIE_DOMAIN: '${env:COOKIE_DOMAIN}',
  },
  events: [
    {
      http: {
        method: 'delete',
        path: '/sign-out',
      },
    },
  ],
})
