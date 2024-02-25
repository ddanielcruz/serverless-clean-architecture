import { randomUUID } from 'node:crypto'

import { ZodError } from 'zod'

import { left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Logger } from '@/core/protocols/logger'
import type { RequestNoteTranscription } from '@/domain/notes/services/request-note-transcription'
import { LoggerStub } from '@/test/stubs/logger-stub'

import { RequestNoteTranscriptionController } from './request-note-transcription-controller'
import type { QueueRequest } from '../../protocols/queue-controller'

describe('RequestNoteTranscriptionController', () => {
  let sut: RequestNoteTranscriptionController
  let logger: Logger
  let requestNoteTranscription: RequestNoteTranscription
  const queueRequest = {
    data: { audioId: randomUUID() },
  } satisfies QueueRequest

  beforeEach(() => {
    logger = new LoggerStub()
    requestNoteTranscription = {
      execute: vi
        .fn()
        .mockResolvedValue(right({ transcriptionId: 'any-transcription-id' })),
    } as unknown as RequestNoteTranscription
    sut = new RequestNoteTranscriptionController(
      logger,
      requestNoteTranscription,
    )
  })

  it('throws if data is invalid', async () => {
    const promise = sut.handle({ data: {} })
    await expect(promise).rejects.toThrow(ZodError)
  })

  it('invokes RequestNoteTranscription with correct parameters', async () => {
    const executeSpy = vi.spyOn(requestNoteTranscription, 'execute')
    await sut.handle(queueRequest)
    expect(executeSpy).toHaveBeenCalledWith({
      audioId: new UniqueEntityId(queueRequest.data.audioId),
    })
  })

  it('throws if transcription request fails', async () => {
    const error = new ResourceNotFoundError()
    vi.spyOn(requestNoteTranscription, 'execute').mockResolvedValue(left(error))
    const promise = sut.handle(queueRequest)
    await expect(promise).rejects.toThrow(error)
  })
})
