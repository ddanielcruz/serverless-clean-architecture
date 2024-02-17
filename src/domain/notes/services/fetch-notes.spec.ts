import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { makeNote } from '@/test/factories/note-factory'
import { InMemoryNotesRepository } from '@/test/repositories/in-memory-notes-repository'

import { FetchNotes } from './fetch-notes'

describe('FetchNotes', () => {
  let sut: FetchNotes
  let notesRepository: InMemoryNotesRepository
  const userId = new UniqueEntityId()

  beforeEach(() => {
    notesRepository = new InMemoryNotesRepository()
    sut = new FetchNotes(notesRepository)
  })

  it('fetches user notes', async () => {
    const notes = new Array(5).fill(null).map(() => makeNote({ userId }))
    notesRepository.items.push(...notes)
    const result = await sut.execute({
      userId,
      pagination: { page: 1, limit: 5 },
    })

    expect(result.isRight()).toBe(true)
    expect(result.value.notes).toEqual(notes)
    expect(result.value.total).toBe(5)
  })

  it('fetches user notes with pagination', async () => {
    const notes = new Array(10).fill(null).map(() => makeNote({ userId }))
    notesRepository.items.push(...notes)
    const result = await sut.execute({
      userId,
      pagination: { page: 2, limit: 5 },
    })

    expect(result.isRight()).toBe(true)
    expect(result.value.notes).toEqual(notes.slice(5, 10))
    expect(result.value.total).toBe(10)
  })
})
