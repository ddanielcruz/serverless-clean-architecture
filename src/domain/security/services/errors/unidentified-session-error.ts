export class UnidentifiedSessionError extends Error {
  constructor() {
    super('Failed to identify the session.')
    this.name = 'UnidentifiedSessionError'
  }
}
