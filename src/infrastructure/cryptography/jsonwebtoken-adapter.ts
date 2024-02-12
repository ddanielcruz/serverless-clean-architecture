import { sign, verify } from 'jsonwebtoken'

import { config } from '@/core/config'
import type {
  SignToken,
  SignTokenParams,
} from '@/domain/security/cryptography/sign-token'
import type {
  VerifyToken,
  VerifyTokenParams,
} from '@/domain/security/cryptography/verify-token'
import type { TokenPayload } from '@/domain/security/entities/token-payload'
import { TokenSecret } from '@/domain/security/entities/token-secret'

export class JsonWebTokenAdapter implements SignToken, VerifyToken {
  private readonly secrets: Record<TokenSecret, string>
  private readonly expirations: Record<TokenSecret, string>

  constructor() {
    this.secrets = {
      [TokenSecret.AccessToken]: config.get('ACCESS_TOKEN_SECRET'),
      [TokenSecret.RefreshToken]: config.get('REFRESH_TOKEN_SECRET'),
    }
    this.expirations = {
      [TokenSecret.AccessToken]: config.get('ACCESS_TOKEN_EXPIRATION'),
      [TokenSecret.RefreshToken]: config.get('REFRESH_TOKEN_EXPIRATION'),
    }
  }

  async sign({ payload, secret }: SignTokenParams): Promise<string> {
    const expiresIn = this.expirations[secret]
    return sign(payload, this.secrets[secret], { expiresIn })
  }

  async verify({
    token,
    secret,
  }: VerifyTokenParams): Promise<TokenPayload | null> {
    try {
      return verify(token, this.secrets[secret]) as TokenPayload
    } catch {
      return null
    }
  }
}
