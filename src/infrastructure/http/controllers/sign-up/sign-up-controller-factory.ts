import { SendEmailVerificationToken } from '@/domain/users/services/send-email-verification-token'
import { SignUp } from '@/domain/users/services/sign-up'
import { SESAdapter } from '@/infrastructure/aws/ses/ses-adapter'
import { DrizzleConfirmationTokensRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-confirmation-tokens-repository'
import { DrizzleUsersRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-users-repository'

import { SignUpController } from './sign-up-controller'
import { applyMiddleware } from '../../middleware/apply-middleware'
import type { HttpController } from '../../protocols/http-controller'

export function makeSignUpController(): HttpController {
  const drizzleUsersRepository = new DrizzleUsersRepository()
  const drizzleConfirmationTokensRepository =
    new DrizzleConfirmationTokensRepository()
  const sesAdapter = new SESAdapter()
  const sendEmailVerificationToken = new SendEmailVerificationToken(
    drizzleConfirmationTokensRepository,
    sesAdapter,
  )
  const signUp = new SignUp(drizzleUsersRepository, sendEmailVerificationToken)
  const signUpController = new SignUpController(signUp)

  return applyMiddleware(signUpController)
}
