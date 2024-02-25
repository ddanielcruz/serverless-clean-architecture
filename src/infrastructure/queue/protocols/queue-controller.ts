import type { Logger } from '@/core/protocols/logger'

export interface QueueRequest {
  data: unknown
}

export abstract class QueueController {
  constructor(protected readonly logger: Logger) {}

  abstract handle(request: QueueRequest): Promise<void>
}
