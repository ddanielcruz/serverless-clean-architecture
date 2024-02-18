import type { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { Mock } from 'vitest'

import { S3Adapter } from './s3-adapter'

const getSignedUrlMock = getSignedUrl as Mock

vi.mock('@aws-sdk/s3-request-presigner', async (importActual) => {
  const module = (await importActual()) as {
    [key: string]: unknown
    getSignedUrl: () => void
  }
  return {
    ...module,
    getSignedUrl: vi.fn().mockImplementation(module.getSignedUrl),
  }
})

describe('S3Adapter', () => {
  let sut: S3Adapter

  beforeAll(() => {
    process.env.AWS_ACCESS_KEY_ID = 'any-access-key'
    process.env.AWS_SECRET_ACCESS_KEY = 'any-secret-access-key'
  })

  beforeEach(() => {
    sut = new S3Adapter()
    getSignedUrlMock.mockClear()
  })

  describe('generateUploadUrl', () => {
    it('generates a new pre-signed URL to upload the file', async () => {
      const url = await sut.generateUploadUrl('file.mp3')
      const command = getSignedUrlMock.mock.calls[0][1] as PutObjectCommand
      expect(url).toBeTruthy()
      expect(url).toBeTruthy()
      expect(url).toContain(sut.bucketName)
      expect(url).toContain('uploads/file.mp3')
      expect(command.input).toMatchObject({
        Bucket: sut.bucketName,
        Key: expect.stringContaining('file.mp3'),
        ACL: 'private',
        ContentType: 'audio/mpeg',
      })
    })

    it.each([
      ['mp3', 'audio/mpeg'],
      ['wav', 'audio/wav'],
      ['ogg', 'audio/ogg'],
    ])(
      'sets the correct content type for %s files',
      async (extension, expected) => {
        const filename = `file.${extension}`
        await sut.generateUploadUrl(filename)
        const command = getSignedUrlMock.mock.calls[0][1] as PutObjectCommand
        expect(command.input.ContentType).toBe(expected)
      },
    )

    it('sets content type to "application/octet-stream" for unknown extensions', async () => {
      const filename = 'file.mp4'
      await sut.generateUploadUrl(filename)
      const command = getSignedUrlMock.mock.calls[0][1] as PutObjectCommand
      expect(command.input.ContentType).toBe('application/octet-stream')
    })

    it('throws an error if getSignedUrl fails to generate a URL', async () => {
      const error = new Error('any-error')
      getSignedUrlMock.mockRejectedValueOnce(error)
      await expect(sut.generateUploadUrl('file.mp3')).rejects.toThrow(error)
    })
  })
})
