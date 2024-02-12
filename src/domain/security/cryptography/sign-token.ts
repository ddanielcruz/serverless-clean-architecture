import type { TokenSecret, TokenPayload } from '../protocols/token'

export interface SignTokenParams {
  payload: TokenPayload
  secret: TokenSecret
}

export interface SignToken {
  sign(params: SignTokenParams): Promise<string>
}
