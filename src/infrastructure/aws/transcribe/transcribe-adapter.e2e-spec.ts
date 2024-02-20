import type { GetObjectCommand } from '@aws-sdk/client-s3'
import type { StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe'

import { config } from '@/core/config'
import { TranscriptionNotFoundError } from '@/domain/notes/protocols/transcriber'
import { makeAudio } from '@/test/factories/audio-factory'
import transcriptionFixture from '@/test/fixtures/transcription-fixture.json'

import { TranscribeAdapter } from './transcribe-adapter'

vi.mock('@aws-sdk/client-s3', async (importActual) => {
  const module = (await importActual()) as { [key: string]: unknown }
  return {
    ...module,
    S3Client: vi.fn().mockImplementation(() => {
      return {
        send: vi.fn().mockResolvedValue({
          Body: {
            transformToString: vi
              .fn()
              .mockResolvedValue(JSON.stringify(transcriptionFixture)),
          },
        }),
      }
    }),
  }
})

vi.mock('@aws-sdk/client-transcribe', async (importActual) => {
  const module = (await importActual()) as { [key: string]: unknown }
  return {
    ...module,
    TranscribeClient: vi.fn().mockImplementation(() => {
      return {
        send: vi.fn(),
      }
    }),
  }
})

describe('TranscribeAdapter', () => {
  let sut: TranscribeAdapter

  beforeEach(() => {
    sut = new TranscribeAdapter()
  })

  describe('loadTranscription', async () => {
    const transcriptionId = 'any-transcription-id'

    it('sends a GetObjectCommand with correct parameters', async () => {
      const sendSpy = vi.spyOn(sut.s3Client, 'send')
      await sut.loadTranscription(transcriptionId)
      expect(sendSpy).toHaveBeenCalled()
      const command = sendSpy.mock.calls[0][0] as GetObjectCommand
      expect(command.input).toMatchObject({
        Bucket: config.get('S3_BUCKET_NAME'),
        Key: `transcriptions/${transcriptionId}.json`,
      })
    })

    it('throws a TranscriptionNotFoundError if transcription is not found', async () => {
      vi.spyOn(sut.s3Client, 'send').mockImplementationOnce(async () => ({
        Body: null,
      }))
      const promise = sut.loadTranscription(transcriptionId)
      await expect(promise).rejects.toThrowError(TranscriptionNotFoundError)
    })

    it('returns transcription result on success', async () => {
      const transcription = await sut.loadTranscription(transcriptionId)
      expect(transcription).toEqual(
        transcriptionFixture.results.transcripts[0].transcript,
      )
    })

    it('joins multiple transcripts into a single one', async () => {
      vi.spyOn(sut.s3Client, 'send').mockImplementationOnce(async () => ({
        Body: {
          transformToString: vi.fn().mockResolvedValue(
            JSON.stringify({
              results: {
                transcripts: [
                  { transcript: 'first transcript' },
                  { transcript: 'second transcript' },
                ],
              },
            }),
          ),
        },
      }))

      const transcription = await sut.loadTranscription(transcriptionId)
      expect(transcription).toEqual('first transcript second transcript')
    })
  })

  describe('requestTranscription', () => {
    it('sends a new StartTranscriptionJobCommand job with correct parameters', async () => {
      const sendSpy = vi.spyOn(sut.transcribeClient, 'send')
      const audio = makeAudio({ filename: 'demo-note.mp3' })
      const { transcriptionId } = await sut.requestTranscription(audio)
      expect(sendSpy).toHaveBeenCalled()
      const command = sendSpy.mock.calls[0][0] as StartTranscriptionJobCommand
      expect(command.input).toMatchObject({
        TranscriptionJobName: transcriptionId,
        LanguageCode: 'en-US',
        MediaFormat: audio.format,
        Media: {
          MediaFileUri: expect.stringContaining(audio.filename),
        },
        OutputBucketName: expect.any(String),
        OutputKey: expect.any(String),
      })
    })

    it('returns transcription ID on success', async () => {
      const audio = makeAudio({ filename: 'demo-note.mp3' })
      const { transcriptionId } = await sut.requestTranscription(audio)
      expect(transcriptionId).toEqual(expect.stringContaining(audio.id.value))
    })
  })
})
