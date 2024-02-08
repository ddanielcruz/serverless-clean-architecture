import { left, right, type Either } from '@/core/either'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { UsersRepository } from '../repositories/users-repository'

export type VerifyUserEmailRequest = {
  userId: UniqueEntityId
}

export type VerifyUserEmailResponse = Either<ResourceNotFoundError, null>

export class VerifyUserEmail {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: VerifyUserEmailRequest): Promise<VerifyUserEmailResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) {
      return left(new ResourceNotFoundError())
    }

    user.verifyEmail()
    await this.usersRepository.save(user)

    return right(null)
  }
}
