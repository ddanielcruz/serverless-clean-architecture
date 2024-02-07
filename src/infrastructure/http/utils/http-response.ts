import { HttpCode } from '../protocols/http-controller'
import type { HttpResponse } from '../protocols/http-controller'

function makeHelper(statusCode: HttpCode) {
  return function (params: Omit<HttpResponse, 'statusCode'>): HttpResponse {
    return { statusCode, ...params }
  }
}

export const ok = makeHelper(HttpCode.OK)
export const created = makeHelper(HttpCode.CREATED)
export const badRequest = makeHelper(HttpCode.BAD_REQUEST)
export const unauthorized = makeHelper(HttpCode.UNAUTHORIZED)
export const forbidden = makeHelper(HttpCode.FORBIDDEN)
export const notFound = makeHelper(HttpCode.NOT_FOUND)
export const conflict = makeHelper(HttpCode.CONFLICT)
export const internalServerError = makeHelper(HttpCode.INTERNAL_SERVER_ERROR)
export const badGateway = makeHelper(HttpCode.BAD_GATEWAY)
export const serviceUnavailable = makeHelper(HttpCode.SERVICE_UNAVAILABLE)

export const noContent = (
  params?: Omit<HttpResponse, 'statusCode' | 'body'>,
): HttpResponse => ({
  statusCode: HttpCode.NO_CONTENT,
  ...params,
})
