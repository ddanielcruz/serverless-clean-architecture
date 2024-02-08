import { config } from '@/core/config'

export type CookieOptions = {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: 'Lax' | 'None' | 'Strict'
  secure?: boolean
}

const isProduction = config.get('NODE_ENV') === 'production'
export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  domain: config.get('COOKIE_DOMAIN'),
  path: '/',
  sameSite: isProduction ? 'None' : 'Lax',
  maxAge: 60 * 60 * 24 * 30, // 30 days
}
