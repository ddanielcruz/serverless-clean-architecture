import { z } from 'zod'

import { InvalidConfigurationError } from './invalid-configuration-error'
import { LogLevel } from '../protocols/logger'

/**
 * Configuration schema. The keys are the environment variable names and the
 * values are the schema used to parse the value.
 *
 * The schema must be defined in this format because the process might not have
 * access to all environment variables in the system. For example, when using
 * serverless functions, the function has access only to a limited set of
 * environment variables.
 */
const configSchema = {
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  CONFIRMATION_TOKEN_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  EMAIL_SENDER: z.string().email(),
  LOG_LEVEL: z.nativeEnum(LogLevel).default(LogLevel.Info),
  OPENAI_API_KEY: z.string(),

  // AWS
  AWS_REGION: z.string(),
  IS_OFFLINE: z.coerce.boolean().default(false),
  S3_BUCKET_NAME: z.string(),
  S3_URL_EXPIRATION: z.coerce.number().positive().int(),

  // Security
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRATION: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRATION: z.string(),
  CORS_ORIGIN: z.string().url(),
  COOKIE_DOMAIN: z.string(),
} as const

type ConfigSchema = {
  [K in keyof typeof configSchema]: z.infer<(typeof configSchema)[K]>
}

/**
 * Configuration service used to access environment variables with schema
 * validation.
 */
export class Configuration {
  get isDevelopment() {
    return this.get('NODE_ENV') === 'development'
  }

  get isProduction() {
    return this.get('NODE_ENV') === 'production'
  }

  /**
   * Get a configuration value from the environment.
   *
   * @param key Configuration key
   * @returns Typed configuration value
   */
  get<TKey extends keyof ConfigSchema>(key: TKey) {
    try {
      const schema = configSchema[key]
      const value = schema.parse(process.env[key])

      return value as ConfigSchema[TKey]
    } catch (error) {
      throw new InvalidConfigurationError(key)
    }
  }
}
