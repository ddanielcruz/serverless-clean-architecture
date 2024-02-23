import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Logger } from '@/core/protocols/logger'
import { FailedToSummarizeNoteError } from '@/domain/notes/protocols/summarizer'
import { makeAudio } from '@/test/factories/audio-factory'
import { makeNote } from '@/test/factories/note-factory'

import { GPTAdapter } from './gpt-adapter'

class LoggerStub implements Logger {
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  critical(): void {}
}

describe('GPTAdapter', () => {
  let sut: GPTAdapter
  let logger: Logger

  beforeEach(() => {
    logger = new LoggerStub()
    sut = new GPTAdapter(logger)
  })

  describe('summarizeNote', () => {
    const transcription = `Quick stock market update: The Dow dipped early on due to inflation worries, but tech stocks like Apple and Microsoft helped the Nasdaq recover. Energy stocks are up with rising oil prices. The S&P 500 is pretty flat, a mix of ups and downs across sectors.

The Fed minutes got released, hinting at a possible rate hike, so the market got a bit jittery. Still, things are looking stable now. We'll talk more at the meeting and go over that biotech stock that's been soaring.`

    const audio = makeAudio({ transcription })
    const note = makeNote({ audio })

    it('returns a ResourceNotFoundError if audio is not transcribed', async () => {
      const note = makeNote()
      const response = await sut.summarizeNote(note)
      expect(response.isLeft()).toBe(true)
      expect(response.value).toBeInstanceOf(ResourceNotFoundError)
    })

    it('returns a FailedToSummarizeNoteError if chat completion throws', async () => {
      const error = 'any-error'
      const logErrorSpy = vi.spyOn(logger, 'error')
      vi.spyOn(sut.client.chat.completions, 'create').mockRejectedValueOnce(
        error,
      )
      const response = await sut.summarizeNote(note)
      expect(response.isLeft()).toBe(true)
      expect(response.value).toBeInstanceOf(FailedToSummarizeNoteError)
      expect(logErrorSpy).toHaveBeenCalledWith(error)
    })

    it('generates a summary of the note', async () => {
      const createSpy = vi
        .spyOn(sut.client.chat.completions, 'create')
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: 'any-summary',
              },
            },
          ],
        } as never)
      const response = await sut.summarizeNote(note)
      assert(response.isRight())
      expect(response.value.summary).toBe('any-summary')

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            {
              role: 'system',
              content: expect.stringContaining(transcription),
            },
          ],
        }),
      )
    })
  })
})
