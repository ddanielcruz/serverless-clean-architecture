export interface SignTokenParams {
  payload: {
    sub: string
  }
  secret: 'access-token' | 'refresh-token'
}

export interface SignToken {
  sign(params: SignTokenParams): Promise<string>
}
