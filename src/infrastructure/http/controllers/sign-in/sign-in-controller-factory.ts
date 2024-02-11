import { SendAuthenticationToken } from '@/domain/security/services/send-authentication-token'
import { SignIn } from '@/domain/users/services/sign-in'
import { LambdaLoggerAdapter } from '@/infrastructure/aws/lambda/adapters/lambda-logger-adapter'
import { SESAdapter } from '@/infrastructure/aws/ses/ses-adapter'
import { DrizzleConfirmationTokensRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-confirmation-tokens-repository'
import { DrizzleUsersRepository } from '@/infrastructure/database/drizzle/repositories/drizzle-users-repository'

import { SignInController } from './sign-in-controller'
import { applyMiddleware } from '../../middleware/apply-middleware'
import type { HttpController } from '../../protocols/http-controller'

export function makeSignInController(): HttpController {
  const drizzleUsersRepository = new DrizzleUsersRepository()
  const drizzleConfirmationTokensRepository =
    new DrizzleConfirmationTokensRepository()
  const sesAdapter = new SESAdapter()
  const lambdaLoggerAdapter = new LambdaLoggerAdapter()
  const sendEmailVerificationToken = new SendAuthenticationToken(
    drizzleConfirmationTokensRepository,
    sesAdapter,
    lambdaLoggerAdapter,
  )
  const signIn = new SignIn(drizzleUsersRepository, sendEmailVerificationToken)
  const signInController = new SignInController(signIn)

  return applyMiddleware(signInController)
}
