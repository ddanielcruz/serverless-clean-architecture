import type { TokenPayload } from '../entities/token-payload'
import type { TokenSecret } from '../entities/token-secret'

export interface VerifyTokenParams {
  token: string
  secret: TokenSecret
}

export interface VerifyToken {
  verify(params: VerifyTokenParams): Promise<TokenPayload | null>
}
