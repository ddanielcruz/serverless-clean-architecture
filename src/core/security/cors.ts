import { config } from '../config'

export type CorsOptions = {
  credentials: boolean
  headers: string[]
  methods: string[]
  origin: string
}

export const corsOptions: CorsOptions = {
  credentials: true,
  headers: ['Authorization', 'Content-Type'],
  methods: ['OPTIONS', 'POST', 'GET', 'PUT', 'DELETE'],
  origin: config.get('CORS_ORIGIN'),
}
