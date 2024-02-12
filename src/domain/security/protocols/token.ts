export enum TokenSecret {
  AccessToken = 'access-token',
  RefreshToken = 'refresh-token',
}

export type TokenPayload = {
  sub: string
}
