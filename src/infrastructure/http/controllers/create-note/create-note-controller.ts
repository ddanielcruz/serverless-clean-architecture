import { z } from 'zod'

import { AudioFormat } from '@/domain/notes/entities/audio'
import type { CreateNote } from '@/domain/notes/services/create-note'

import type {
  HttpController,
  HttpRequest,
  HttpResponse,
} from '../../protocols/http-controller'
import { ok, unauthorized } from '../../utils/http-response'

export class CreateNoteController implements HttpController {
  private readonly serializer = z.object({
    audioFormat: z.nativeEnum(AudioFormat),
  })

  constructor(private readonly createNote: CreateNote) {}

  async handle({ session, body }: HttpRequest): Promise<HttpResponse> {
    if (!session) {
      return unauthorized()
    }

    const { audioFormat } = this.serializer.parse(body)
    const response = await this.createNote.execute({
      userId: session.userId,
      audioFormat,
    })

    return ok({ body: response.value })
  }
}
