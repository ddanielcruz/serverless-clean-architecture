import type { S3Handler } from 'aws-lambda'

import { makeRequestNoteTranscriptionController } from '@/infrastructure/queue/controllers/request-note-transcription/request-note-transcription-controller-factory'

import { middyfy } from '../../middy'

const controller = makeRequestNoteTranscriptionController()
const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const audioId = record.s3.object.key.split('/')[-1].split('.')[0]
    await controller.handle({ data: { audioId } })
  }
}

export const main = middyfy(handler, 's3')
