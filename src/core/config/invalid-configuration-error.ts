export class InvalidConfigurationError extends Error {
  constructor(key: string) {
    super(`Configuration "${key}" is invalid.`)
    this.name = 'InvalidConfigurationError'
  }
}
