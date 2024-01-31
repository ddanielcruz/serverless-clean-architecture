export type SignTokenSecret = 'access-token' | 'refresh-token'

export interface SignTokenParams {
  payload: {
    sub: string
  }
  secret: SignTokenSecret
}

export interface SignToken {
  sign(params: SignTokenParams): Promise<string>
}
