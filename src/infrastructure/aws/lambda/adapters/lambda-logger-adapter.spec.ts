import type { Logger as LambdaLogger } from '@aws-lambda-powertools/logger'
import { serializeError } from 'serialize-error'

import type { LogMessage } from '@/core/protocols/logger'

import { LambdaLoggerAdapter } from './lambda-logger-adapter'

describe('LambdaLoggerAdapter', () => {
  let sut: LambdaLoggerAdapter
  let logger: LambdaLogger
  const logMessage: LogMessage = { message: 'any-message' }

  beforeEach(() => {
    sut = new LambdaLoggerAdapter()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    logger = sut.logger
  })

  describe.each(['debug', 'info', 'warn'] as const)('%s', (method) => {
    it(`should call LambdaLogger.${method} with correct value`, () => {
      const methodSpy = vi
        .spyOn(logger, method)
        .mockImplementationOnce(() => {})
      sut[method](logMessage)
      expect(methodSpy).toHaveBeenCalledWith(logMessage)
    })
  })

  describe.each(['error', 'critical'] as const)('%s', (method) => {
    it(`should call LambdaLogger.${method} with correct value`, () => {
      const methodSpy = vi
        .spyOn(logger, method)
        .mockImplementationOnce(() => {})
      sut[method](logMessage)
      expect(methodSpy).toHaveBeenCalledWith(logMessage)
    })

    it(`should call LambdaLogger.${method} with serialized error`, () => {
      const error = new Error('any-error')
      const methodSpy = vi
        .spyOn(logger, method)
        .mockImplementationOnce(() => {})
      sut[method](error)
      expect(methodSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: error.message,
          ...serializeError(error),
        }),
      )
    })
  })
})
