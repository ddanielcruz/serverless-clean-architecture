export class TokenExpiredError extends Error {
  constructor() {
    super('Token is expired.')
    this.name = 'TokenExpiredError'
  }
}
