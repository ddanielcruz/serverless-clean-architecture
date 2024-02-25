import type { Logger } from '@/core/protocols/logger'

export class LoggerStub implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  critical(): void {}
}
