import { right, type Either, left } from '@/core/either'
import type { SendEmailVerificationToken } from '@/domain/security/services/send-email-verification-token'

import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { User } from '../entities/user'
import type { UsersRepository } from '../repositories/users-repository'

export type SignUpRequest = {
  name: string
  email: string
}

export type SignUpResponse = Either<UserAlreadyExistsError, null>

export class SignUp {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sendEmailVerificationToken: SendEmailVerificationToken,
  ) {}

  async execute({ name, email }: SignUpRequest): Promise<SignUpResponse> {
    // Check if email is not already in use
    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      // If used, but not verified, send another email verification token
      if (!userWithSameEmail.isEmailVerified) {
        await this.sendEmailVerificationToken.execute({
          user: userWithSameEmail,
        })

        return right(null)
      }

      return left(new UserAlreadyExistsError(email))
    }

    // Create a new user
    const user = new User({ name, email })
    await this.usersRepository.create(user)

    // Send email verification token
    await this.sendEmailVerificationToken.execute({ user })

    return right(null)
  }
}
