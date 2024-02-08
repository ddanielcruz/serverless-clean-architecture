import type { CookieOptions } from '../config/cookie'

export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
) {
  const cookie = [`${name}=${value}`]

  if (options.domain) {
    cookie.push(`Domain=${options.domain}`)
  }

  if (options.expires) {
    cookie.push(`Expires=${options.expires.toUTCString()}`)
  }

  if (options.httpOnly) {
    cookie.push('HttpOnly')
  }

  if (options.maxAge) {
    cookie.push(`Max-Age=${options.maxAge}`)
  }

  if (options.path) {
    cookie.push(`Path=${options.path}`)
  }

  if (options.sameSite) {
    cookie.push(`SameSite=${options.sameSite}`)
  }

  if (options.secure) {
    cookie.push('Secure')
  }

  return cookie.join('; ')
}
