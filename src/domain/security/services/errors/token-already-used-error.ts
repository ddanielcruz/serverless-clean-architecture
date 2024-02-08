export class TokenAlreadyUsedError extends Error {
  constructor() {
    super('Token is already used.')
    this.name = 'TokenAlreadyUsedError'
  }
}
