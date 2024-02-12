import type { TokenSecret, TokenPayload } from '../protocols/token'

export interface VerifyTokenParams {
  token: string
  secret: TokenSecret
}

export interface VerifyToken {
  verify(params: VerifyTokenParams): Promise<TokenPayload | null>
}
