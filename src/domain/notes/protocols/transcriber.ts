import type { Audio } from '../entities/audio'

export interface Transcriber {
  requestTranscription(audio: Audio): Promise<{ transcriptionId: string }>
  loadTranscription(transcriptionId: string): Promise<string>
}

export class TranscriptionNotFoundError extends Error {
  constructor(transcriptionId: string) {
    super(`Transcription "${transcriptionId}" not found.`)
    this.name = 'TranscriptionNotFoundError'
  }
}
