import {
  StartTranscriptionJobCommand,
  TranscribeClient,
} from '@aws-sdk/client-transcribe'

import { config } from '@/core/config'
import type { Audio } from '@/domain/notes/entities/audio'
import type { Transcriber } from '@/domain/notes/protocols/transcriber'

export class TranscribeAdapter implements Transcriber {
  readonly client: TranscribeClient

  constructor() {
    this.client = new TranscribeClient({ region: config.get('AWS_REGION') })
  }

  async requestTranscription(
    audio: Audio,
  ): Promise<{ transcriptionId: string }> {
    const transcriptionId = `${audio.id.value}-${Date.now()}`
    const bucketName = config.get('S3_BUCKET_NAME')
    const command = new StartTranscriptionJobCommand({
      TranscriptionJobName: transcriptionId,
      LanguageCode: 'en-US',
      MediaFormat: audio.format,
      Media: {
        MediaFileUri: `s3://${bucketName}/uploads/${audio.filename}`,
      },
      OutputBucketName: bucketName,
      OutputKey: `transcriptions/${transcriptionId}.json`,
    })

    await this.client.send(command)

    return { transcriptionId }
  }
}
