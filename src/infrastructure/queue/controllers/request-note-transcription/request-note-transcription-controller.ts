import { z } from 'zod'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { RequestNoteTranscription } from '@/domain/notes/services/request-note-transcription'

import type {
  QueueRequest,
  QueueController,
} from '../../protocols/queue-controller'

export class RequestNoteTranscriptionController implements QueueController {
  private readonly serializer = z.object({ audioId: z.string().uuid() })

  constructor(
    private readonly requestNoteTranscription: RequestNoteTranscription,
  ) {}

  async handle(request: QueueRequest): Promise<void> {
    const data = this.serializer.parse(request.data)
    const audioId = new UniqueEntityId(data.audioId)
    const response = await this.requestNoteTranscription.execute({ audioId })

    if (response.isLeft()) {
      throw response.value
    }
  }
}
