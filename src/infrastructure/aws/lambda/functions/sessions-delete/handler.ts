import { makeSignOutController } from '@/infrastructure/http/controllers/sign-out/sign-out-controller-factory'

import { apiGatewayHttpAdapter } from '../../adapters/api-gateway-http-adapter'
import { middyfy } from '../../middy'

const controller = makeSignOutController()
export const main = middyfy(apiGatewayHttpAdapter(controller))
