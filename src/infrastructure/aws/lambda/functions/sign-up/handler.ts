import { makeSignUpController } from '@/infrastructure/http/controllers/sign-up/sign-up-controller-factory'

import { apiGatewayHttpAdapter } from '../../adapters/api-gateway-http-adapter'
import { middyfy } from '../../middy'

const controller = makeSignUpController()
export const main = middyfy(apiGatewayHttpAdapter(controller))
