import { sign } from 'jsonwebtoken'

import { config } from '@/core/config'
import type {
  SignToken,
  SignTokenParams,
  SignTokenSecret,
} from '@/domain/security/cryptography/sign-token'

export class JsonWebTokenAdapter implements SignToken {
  private readonly secrets: Record<SignTokenSecret, string>
  private readonly expirations: Record<SignTokenSecret, string>

  constructor() {
    this.secrets = {
      'access-token': config.get('ACCESS_TOKEN_SECRET'),
      'refresh-token': config.get('REFRESH_TOKEN_SECRET'),
    }
    this.expirations = {
      'access-token': config.get('ACCESS_TOKEN_EXPIRATION'),
      'refresh-token': config.get('REFRESH_TOKEN_EXPIRATION'),
    }
  }

  async sign({ payload, secret }: SignTokenParams): Promise<string> {
    const expiresIn = this.expirations[secret]
    return sign(payload, this.secrets[secret], { expiresIn })
  }
}
