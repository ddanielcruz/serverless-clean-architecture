import { Logger as LambdaLogger } from '@aws-lambda-powertools/logger'
import { serializeError } from 'serialize-error'

import type { LogMessage, Logger } from '@/core/protocols/logger'

export class LambdaLoggerAdapter implements Logger {
  private readonly logger: LambdaLogger

  constructor() {
    this.logger = new LambdaLogger()
  }

  debug(message: LogMessage): void {
    this.logger.debug(message)
  }

  info(message: LogMessage): void {
    this.logger.info(message)
  }

  warn(message: LogMessage): void {
    this.logger.warn(message)
  }

  error(message: LogMessage | Error): void {
    this.logger.error(this.normalizeErrorMessage(message))
  }

  critical(message: LogMessage | Error): void {
    this.logger.critical(this.normalizeErrorMessage(message))
  }

  private normalizeErrorMessage(message: LogMessage | Error): LogMessage {
    if (message instanceof Error) {
      const serializedError = serializeError(message)
      return { message: message.message, ...serializedError }
    }

    return message
  }
}
