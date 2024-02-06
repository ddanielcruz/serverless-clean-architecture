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
