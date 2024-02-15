import { makeRefreshSessionController } from '@/infrastructure/http/controllers/refresh-session/refresh-session-controller-factory'

import { apiGatewayHttpAdapter } from '../../adapters/api-gateway-http-adapter'
import { middyfy } from '../../middy'

const controller = makeRefreshSessionController()
export const main = middyfy(apiGatewayHttpAdapter(controller))
