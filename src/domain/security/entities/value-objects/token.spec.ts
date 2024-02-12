import { Token } from './token'

describe('Token', () => {
  describe('constructor', () => {
    it('creates a new token', () => {
      const expiresAt = new Date()
      const token = new Token({ value: 'any-value', expiresAt })
      expect(token.value).toEqual('any-value')
      expect(token.expiresAt).toEqual(expiresAt)
    })
  })

  describe('isExpired', () => {
    it('returns true if token is expired', () => {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() - 1)
      const token = new Token({ value: 'any-value', expiresAt })
      expect(token.isExpired).toBe(true)
    })

    it('returns false if token is not expired', () => {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      const token = new Token({ value: 'any-value', expiresAt })
      expect(token.isExpired).toBe(false)
    })
  })

  describe('equals', () => {
    it('returns true if tokens are equal', () => {
      const expiresAt = new Date()
      const tokenA = new Token({ value: 'any-value', expiresAt })
      const tokenB = new Token({ value: 'any-value', expiresAt })
      expect(tokenA.equals(tokenB)).toBe(true)
    })

    it('returns false if token values are different', () => {
      const expiresAt = new Date()
      const tokenA = new Token({ value: 'any-value', expiresAt })
      const tokenB = new Token({ value: 'other-value', expiresAt })
      expect(tokenA.equals(tokenB)).toBe(false)
    })

    it('returns false if token expiresAt are different', () => {
      const tokenA = new Token({ value: 'any-value', expiresAt: new Date() })
      const tokenB = new Token({
        value: 'any-value',
        expiresAt: new Date(2024, 0, 1),
      })
      expect(tokenA.equals(tokenB)).toBe(false)
    })

    it('returns false if token is not an instance of Token', () => {
      const token = new Token({ value: 'any-value', expiresAt: new Date() })
      expect(token.equals('invalid-token')).toBe(false)
      expect(token.equals(null)).toBe(false)
      expect(token.equals(undefined)).toBe(false)
    })
  })
})
