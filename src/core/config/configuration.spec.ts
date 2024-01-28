import { Configuration } from './configuration'
import { InvalidConfigurationError } from './invalid-configuration-error'

describe('Configuration', () => {
  const sut = new Configuration()

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.CONFIRMATION_TOKEN_URL = undefined
  })

  it('returns a default value if variable is not defined', () => {
    delete process.env.NODE_ENV
    expect(sut.get('NODE_ENV')).toEqual('development')
  })

  it('throws if variable is not defined and does not have a default value', () => {
    expect(() => sut.get('CONFIRMATION_TOKEN_URL')).toThrow(
      InvalidConfigurationError,
    )
  })

  it('returns the value if variable is defined', () => {
    process.env.CONFIRMATION_TOKEN_URL = 'https://example.com'
    expect(sut.get('CONFIRMATION_TOKEN_URL')).toEqual('https://example.com')
  })
})
