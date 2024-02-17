export interface FileUploader {
  generateUploadUrl(filename: string): Promise<string>
}
