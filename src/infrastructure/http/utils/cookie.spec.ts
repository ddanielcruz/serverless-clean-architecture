import { serializeCookie } from './cookie'

describe('Cookie', () => {
  describe('serializeCookie', () => {
    it('should serialize a cookie with all options', () => {
      const cookie = serializeCookie('name', 'value', {
        domain: 'domain',
        expires: new Date('2022-01-01'),
        httpOnly: true,
        maxAge: 60,
        path: 'path',
        sameSite: 'Lax',
        secure: true,
      })

      expect(cookie).toBe(
        'name=value; Domain=domain; Expires=Sat, 01 Jan 2022 00:00:00 GMT; HttpOnly; Max-Age=60; Path=path; SameSite=Lax; Secure',
      )
    })

    it('should serialize a cookie with only name and value', () => {
      const cookie = serializeCookie('name', 'value')
      expect(cookie).toBe('name=value')
    })
  })
})
