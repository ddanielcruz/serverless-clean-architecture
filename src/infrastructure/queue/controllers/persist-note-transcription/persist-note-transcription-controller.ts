import { z } from 'zod'

import type { PersistNoteTranscription } from '@/domain/notes/services/persist-note-transcription'
import { getAudioIdFromTranscriptionId } from '@/infrastructure/aws/transcribe/transcription-id'

import type {
  QueueController,
  QueueRequest,
} from '../../protocols/queue-controller'

export class PersistNoteTranscriptionController implements QueueController {
  private readonly serializer = z.object({ transcriptionId: z.string() })

  constructor(
    private readonly persistNoteTranscription: PersistNoteTranscription,
  ) {}

  async handle(request: QueueRequest): Promise<void> {
    const { transcriptionId } = this.serializer.parse(request.data)
    const audioId = getAudioIdFromTranscriptionId(transcriptionId)
    const response = await this.persistNoteTranscription.execute({
      audioId,
      transcriptionId,
    })

    if (response.isLeft()) {
      throw response.value
    }
  }
}
