import { Logger as LambdaLogger } from '@aws-lambda-powertools/logger'
import type { LogLevel as LambdaLoggerLogLevel } from '@aws-lambda-powertools/logger/lib/types'
import { serializeError } from 'serialize-error'

import { config } from '@/core/config'
import { LogLevel, type LogMessage, type Logger } from '@/core/protocols/logger'

export class LambdaLoggerAdapter implements Logger {
  private readonly logger: LambdaLogger

  constructor() {
    this.logger = new LambdaLogger({ logLevel: this.getLogLevel() })
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

  private getLogLevel(): LambdaLoggerLogLevel {
    const logLevel = config.get('LOG_LEVEL')
    switch (logLevel) {
      case LogLevel.Info:
        return 'INFO'
      case LogLevel.Warn:
        return 'WARN'
      case LogLevel.Error:
        return 'ERROR'
      case LogLevel.Critical:
        return 'CRITICAL'
      case LogLevel.Debug:
        return 'DEBUG'
      default:
        throw new Error(`Log level not supported: ${logLevel}`)
    }
  }
}
