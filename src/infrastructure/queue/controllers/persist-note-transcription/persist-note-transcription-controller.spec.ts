import { randomUUID } from 'node:crypto'

import { ZodError } from 'zod'

import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { PersistNoteTranscription } from '@/domain/notes/services/persist-note-transcription'
import { getAudioIdFromTranscriptionId } from '@/infrastructure/aws/transcribe/transcription-id'

import { PersistNoteTranscriptionController } from './persist-note-transcription-controller'
import type { QueueRequest } from '../../protocols/queue-controller'

describe('PersistNoteTranscriptionController', () => {
  let sut: PersistNoteTranscriptionController
  let persistNoteTranscription: PersistNoteTranscription
  const queueRequest = {
    data: { transcriptionId: `${randomUUID()}-${Date.now()}` },
  } satisfies QueueRequest

  beforeEach(() => {
    persistNoteTranscription = {
      execute: vi.fn().mockResolvedValue(right(null)),
    } as unknown as PersistNoteTranscription
    sut = new PersistNoteTranscriptionController(persistNoteTranscription)
  })

  it('throws if data is invalid', async () => {
    const promise = sut.handle({ data: {} })
    await expect(promise).rejects.toThrow(ZodError)
  })

  it('persists note transcription with correct parameters', async () => {
    const executeSpy = vi.spyOn(persistNoteTranscription, 'execute')
    await sut.handle(queueRequest)
    const { transcriptionId } = queueRequest.data
    expect(executeSpy).toHaveBeenCalledWith({
      audioId: getAudioIdFromTranscriptionId(transcriptionId),
      transcriptionId,
    })
  })

  it('throws if it fails to persist note transcription', async () => {
    const error = new ResourceNotFoundError()
    vi.spyOn(persistNoteTranscription, 'execute').mockResolvedValueOnce(
      left(error),
    )
    const promise = sut.handle(queueRequest)
    await expect(promise).rejects.toThrow(error)
  })
})
