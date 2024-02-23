import { OpenAI } from 'openai'

import { config } from '@/core/config'
import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Logger } from '@/core/protocols/logger'
import type { Note } from '@/domain/notes/entities/note'
import {
  FailedToSummarizeNoteError,
  type SummarizeNoteResponse,
  type Summarizer,
} from '@/domain/notes/protocols/summarizer'

export class GPTAdapter implements Summarizer {
  readonly client: OpenAI

  constructor(private readonly logger: Logger) {
    this.client = new OpenAI({ apiKey: config.get('OPENAI_API_KEY') })
  }

  async summarizeNote(note: Note): Promise<SummarizeNoteResponse> {
    const transcription = note.audio.transcription
    if (!transcription) {
      return left(new ResourceNotFoundError())
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.composeSummarizeNotePrompt(transcription),
          },
        ],
      })
      const summary = response.choices[0].message.content as string

      return right({ summary })
    } catch (error) {
      this.logger.error(error as Error)
      return left(new FailedToSummarizeNoteError())
    }
  }

  private composeSummarizeNotePrompt(transcription: string): string {
    return `You must write a summary of a text you're going to receive. This text is a transcription of a voice memo of the person you're working for. Your goal is writing a small and straight to the point summary of what the person is saying, and create a bullet list with the most important information.

The output must be in MARKDOWN format, without headers. Be concise, focus in writing a good and short summary.
    
Here's the text:
    
${transcription}`
  }
}
