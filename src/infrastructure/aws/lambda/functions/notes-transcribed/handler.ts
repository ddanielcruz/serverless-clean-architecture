import type { S3Handler } from 'aws-lambda'

import { makePersistNoteTranscriptionController } from '@/infrastructure/queue/controllers/persist-note-transcription/persist-note-transcription-controller-factory'

import { middyfy } from '../../middy'

const controller = makePersistNoteTranscriptionController()
const handler: S3Handler = async (event) => {
  for (const record of event.Records) {
    const transcriptionId = record.s3.object.key.split('/')[-1].split('.')[0]
    await controller.handle({ data: { transcriptionId } })
  }
}

export const main = middyfy(handler, 's3')
