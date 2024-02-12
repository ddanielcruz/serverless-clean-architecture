import type { TokenSecret } from '../entities/token-secret'

export interface SignTokenParams {
  payload: {
    sub: string
  }
  secret: TokenSecret
}

export interface SignToken {
  sign(params: SignTokenParams): Promise<string>
}
