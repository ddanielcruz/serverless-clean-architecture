import { ZodError } from 'zod'

import { right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { CreateNote } from '@/domain/notes/services/create-note'

import { CreateNoteController } from './create-note-controller'
import type { HttpRequest } from '../../protocols/http-controller'
import { ok, unauthorized } from '../../utils/http-response'

describe('CreateNoteController', () => {
  let sut: CreateNoteController
  let createNote: CreateNote

  const httpRequest = {
    body: {
      audioFormat: 'ogg',
    },
    session: {
      sessionId: new UniqueEntityId(),
      userId: new UniqueEntityId(),
    },
  } as HttpRequest

  beforeEach(() => {
    createNote = {
      execute: vi
        .fn()
        .mockResolvedValue(right({ uploadUrl: 'any-upload-url' })),
    } as unknown as CreateNote
    sut = new CreateNoteController(createNote)
  })

  it('returns 401 if request is not authorized', async () => {
    const response = await sut.handle({ ...httpRequest, session: null })
    expect(response).toEqual(unauthorized())
  })

  it('throws a ZodError if body is invalid', async () => {
    const promise = sut.handle({
      ...httpRequest,
      body: { audioFormat: 'invalid' },
    })
    await expect(promise).rejects.toThrow(ZodError)
  })

  it('returns 200 with an upload URL on success', async () => {
    const response = await sut.handle(httpRequest)
    expect(response).toEqual(ok({ body: { uploadUrl: 'any-upload-url' } }))
  })
})
