import type { FetchOptions } from 'ofetch'
import type { ZoltaApiError } from './error.js'

export type ZoltaValidationFieldError = {
  type: string
  message: string
}

export type ZoltaValidationFieldErrorsMap = Record<string, string | string[]>

export type ZoltaPublicError = {
  code: string
  message?: string
  hint?: string
  entitlement_code?: string
  limit?: number
  used?: number
  remaining?: number
  resets_at?: string | null
  errors?: ZoltaValidationFieldError[] | ZoltaValidationFieldErrorsMap
}

export type ZoltaPublicErrorBag = { public: ZoltaPublicError }

export type ZoltaErrorBag
  = | ZoltaPublicErrorBag
    | []
    | Record<string, unknown>
    | null

export type ZoltaApiEnvelope<TData = Record<string, unknown>> = {
  success: boolean
  message: string
  data: TData
  errors: ZoltaErrorBag
  debug: unknown[]
}

export type ZoltaApiClientOptions = {
  baseURL: string
  bearerToken?: string
  internalToken?: string
  headers?: HeadersInit
  fetchOptions?: FetchOptions
  onUnauthorized?: (error: ZoltaApiError) => Promise<void> | void
}
