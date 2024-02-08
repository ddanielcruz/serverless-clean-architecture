export type LogMessage = {
  message: string
  [key: string]: unknown
}

export interface Logger {
  debug(message: LogMessage): void
  info(message: LogMessage): void
  warn(message: LogMessage): void
  error(message: LogMessage | Error): void
  critical(message: LogMessage | Error): void
}

export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Critical = 'critical',
}
