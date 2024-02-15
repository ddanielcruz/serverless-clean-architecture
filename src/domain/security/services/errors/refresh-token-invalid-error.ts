export class RefreshTokenInvalidError extends Error {
  constructor() {
    super('Refresh token is invalid.')
    this.name = 'RefreshTokenInvalidError'
  }
}
