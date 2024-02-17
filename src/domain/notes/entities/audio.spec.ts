import { Audio, AudioFormat } from './audio'

describe('Audio', () => {
  it('throws if filename does not match format', () => {
    expect(() => {
      return new Audio({ filename: 'file.mp3', format: AudioFormat.WAV })
    }).toThrow()
  })

  it('sets duration to null if not provided', () => {
    const audio = new Audio({ filename: 'file.mp3', format: AudioFormat.MP3 })
    expect(audio.duration).toBeNull()
  })

  it('sets duration to received value', async () => {
    const audio = new Audio({
      filename: 'file.mp3',
      format: AudioFormat.MP3,
      duration: 100,
    })
    expect(audio.duration).toBe(100)
  })
})
