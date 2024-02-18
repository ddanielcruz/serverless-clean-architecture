import { makeCreateNoteController } from '@/infrastructure/http/controllers/create-note/create-note-controller-factory'

import { apiGatewayHttpAdapter } from '../../adapters/api-gateway-http-adapter'
import { middyfy } from '../../middy'

const controller = makeCreateNoteController()
export const main = middyfy(apiGatewayHttpAdapter(controller))
