import { z } from 'zod'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Logger } from '@/core/protocols/logger'
import type { RequestNoteTranscription } from '@/domain/notes/services/request-note-transcription'

import type { QueueRequest } from '../../protocols/queue-controller'
import { QueueController } from '../../protocols/queue-controller'

export class RequestNoteTranscriptionController extends QueueController {
  private readonly serializer = z.object({ audioId: z.string().uuid() })

  constructor(
    logger: Logger,
    private readonly requestNoteTranscription: RequestNoteTranscription,
  ) {
    super(logger)
  }

  async handle(request: QueueRequest): Promise<void> {
    const data = this.serializer.parse(request.data)
    const audioId = new UniqueEntityId(data.audioId)
    const response = await this.requestNoteTranscription.execute({ audioId })

    if (response.isLeft()) {
      this.logger.error(response.value)
      throw response.value
    }
  }
}
