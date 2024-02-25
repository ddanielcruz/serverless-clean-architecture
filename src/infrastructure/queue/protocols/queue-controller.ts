export interface QueueRequest {
  data: unknown
}

export interface QueueController {
  handle(request: QueueRequest): Promise<void>
}
