import type { Audio } from '../entities/audio'

export interface Transcriber {
  requestTranscription(audio: Audio): Promise<{ transcriptionId: string }>
}
