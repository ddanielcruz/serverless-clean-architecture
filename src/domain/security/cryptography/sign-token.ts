import type { TokenPayload } from '../entities/token-payload'
import type { TokenSecret } from '../entities/token-secret'

export interface SignTokenParams {
  payload: TokenPayload
  secret: TokenSecret
}

export interface SignToken {
  sign(params: SignTokenParams): Promise<string>
}
