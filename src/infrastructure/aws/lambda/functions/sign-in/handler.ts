import { makeSignInController } from '@/infrastructure/http/controllers/sign-in/sign-in-controller-factory'

import { apiGatewayHttpAdapter } from '../../adapters/api-gateway-http-adapter'
import { middyfy } from '../../middy'

const controller = makeSignInController()
export const main = middyfy(apiGatewayHttpAdapter(controller))
