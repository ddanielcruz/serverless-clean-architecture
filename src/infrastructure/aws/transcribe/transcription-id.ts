import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export function makeTranscriptionIdFromAudioId(audioId: UniqueEntityId) {
  return `${audioId.toString()}-${Date.now()}`
}

export function getAudioIdFromTranscriptionId(
  transcriptionId: string,
): UniqueEntityId {
  const segments = transcriptionId.split('-')
  const value = segments.slice(0, segments.length - 1).join('-')

  return new UniqueEntityId(value)
}
