export type LogMessage = {
  message: string
  [key: string]: unknown
}

export interface Logger {
  info(message: LogMessage): void
  error(message: LogMessage | Error): void
  warn(message: LogMessage): void
  debug(message: LogMessage): void
  critical(message: LogMessage): void
}
