import { Logger as LambdaLogger } from '@aws-lambda-powertools/logger'
import { serializeError } from 'serialize-error'

import type { LogMessage, Logger } from '@/core/protocols/logger'

export class LambdaLoggerAdapter implements Logger {
  private readonly logger: LambdaLogger

  constructor() {
    this.logger = new LambdaLogger()
  }

  info(message: LogMessage): void {
    this.logger.info(message)
  }

  error(message: LogMessage | Error): void {
    if (message instanceof Error) {
      const serializedError = serializeError(message)
      this.logger.error({ message: message.message, ...serializedError })
    } else {
      this.logger.error(message)
    }
  }

  warn(message: LogMessage): void {
    this.logger.warn(message)
  }

  debug(message: LogMessage): void {
    this.logger.debug(message)
  }

  critical(message: LogMessage): void {
    this.logger.critical(message)
  }
}
