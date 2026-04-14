import { createHttpClient } from './http'
import { createStaticClient } from './static'
import type { ApiClient } from './types'

export * from './types'

const mode = import.meta.env.VITE_ATLAS_MODE

export const api: ApiClient = mode === 'static' ? createStaticClient() : createHttpClient()
