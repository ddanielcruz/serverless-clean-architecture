import type { Session } from '@/domain/security/entities/session'

import type * as schema from '../schema'

type DrizzleSession = typeof schema.sessions.$inferSelect

export class DrizzleSessionMapper {
  static toDrizzle(session: Session): DrizzleSession {
    return {
      id: session.id.value,
      userId: session.userId.toString(),
      ipAddressId: session.ipAddress.id.toString(),
      userAgent: session.userAgent,
      invalidatedAt: session.invalidatedAt,
      createdAt: session.createdAt,
    }
  }
}
