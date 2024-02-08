import { right, type Either, left } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { SendAuthenticationToken } from './send-authentication-token'
import type { UsersRepository } from '../repositories/users-repository'

export type SignInRequest = {
  email: string
}

export type SignInResponse = Either<ResourceNotFoundError, null>

export class SignIn {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sendAuthenticationToken: SendAuthenticationToken,
  ) {}

  async execute({ email }: SignInRequest): Promise<SignInResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user || !user.isEmailVerified) {
      return left(new ResourceNotFoundError())
    }

    await this.sendAuthenticationToken.execute({ user })

    return right(null)
  }
}
