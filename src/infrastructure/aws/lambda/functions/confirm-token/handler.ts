import { makeConfirmTokenController } from '@/infrastructure/http/controllers/confirm-token/confirm-token-controller-factory'

import { apiGatewayHttpAdapter } from '../../adapters/api-gateway-http-adapter'
import { middyfy } from '../../middy'

const controller = makeConfirmTokenController()
export const main = middyfy(apiGatewayHttpAdapter(controller))
