import type { StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe'

import { makeAudio } from '@/test/factories/audio-factory'

import { TranscribeAdapter } from './transcribe-adapter'

vi.mock('@aws-sdk/client-transcribe', async (importActual) => {
  const module = await importActual()
  return {
    ...(module as Record<string, unknown>),
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

  describe('requestTranscription', () => {
    it('sends a new StartTranscriptionJobCommand job with correct parameters', async () => {
      const sendSpy = vi.spyOn(sut.client, 'send')
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
