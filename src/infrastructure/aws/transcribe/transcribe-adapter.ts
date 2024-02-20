import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import {
  StartTranscriptionJobCommand,
  TranscribeClient,
} from '@aws-sdk/client-transcribe'

import { config } from '@/core/config'
import type { Audio } from '@/domain/notes/entities/audio'
import {
  TranscriptionNotFoundError,
  type Transcriber,
} from '@/domain/notes/protocols/transcriber'

interface TranscriptionOutput {
  results: {
    transcripts: { transcript: string }[]
  }
}

export class TranscribeAdapter implements Transcriber {
  readonly transcribeClient: TranscribeClient
  readonly s3Client: S3Client

  constructor() {
    const region = config.get('AWS_REGION')
    this.transcribeClient = new TranscribeClient({ region })
    this.s3Client = new S3Client({ region })
  }

  async loadTranscription(transcriptionId: string): Promise<string> {
    const bucketName = config.get('S3_BUCKET_NAME')
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: `transcriptions/${transcriptionId}.json`,
    })

    const { Body } = await this.s3Client.send(command)
    if (!Body) {
      throw new TranscriptionNotFoundError(transcriptionId)
    }

    const transcriptionOutput = await Body.transformToString()
    const {
      results: { transcripts },
    } = JSON.parse(transcriptionOutput) as TranscriptionOutput

    return transcripts.map((t) => t.transcript).join(' ')
  }

  async requestTranscription(
    audio: Audio,
  ): Promise<{ transcriptionId: string }> {
    const transcriptionId = `${audio.id.toString()}-${Date.now()}`
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

    await this.transcribeClient.send(command)

    return { transcriptionId }
  }
}
