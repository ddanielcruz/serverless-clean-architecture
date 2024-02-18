import { extname } from 'node:path'

import { S3, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { config } from '@/core/config'
import type { FileUploader } from '@/domain/notes/protocols/file-uploader'

import { S3_OFFLINE_OPTIONS } from './s3-constants'

export class S3Adapter implements FileUploader {
  public readonly bucketName = config.get('S3_BUCKET_NAME')
  public readonly urlExpirationInSeconds = config.get('S3_URL_EXPIRATION')
  public readonly client: S3

  constructor() {
    const isOffline = config.get('IS_OFFLINE')
    this.client = new S3(isOffline ? S3_OFFLINE_OPTIONS : {})
  }

  async generateUploadUrl(filename: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `uploads/${filename}`,
      ACL: 'private',
      ContentType: this.filenameToContentType(filename),
    })

    return await getSignedUrl(this.client, command, {
      expiresIn: this.urlExpirationInSeconds,
    })
  }

  private filenameToContentType(filename: string): string {
    const extension = extname(filename).slice(1).toLowerCase()

    switch (extension) {
      case 'mp3':
        return 'audio/mpeg'
      case 'wav':
        return 'audio/wav'
      case 'ogg':
        return 'audio/ogg'
      default:
        return 'application/octet-stream'
    }
  }
}
