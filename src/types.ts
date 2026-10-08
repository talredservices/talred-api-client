import type { FetchOptions } from 'ofetch'
import type { TalredApiError } from './error.js'

export type TalredValidationFieldError = {
  type: string
  message: string
}

export type TalredValidationFieldErrorsMap = Record<string, string | string[]>

export type TalredPublicError = {
  code: string
  message?: string
  hint?: string
  entitlement_code?: string
  limit?: number
  used?: number
  remaining?: number
  resets_at?: string | null
  errors?: TalredValidationFieldError[] | TalredValidationFieldErrorsMap
}

export type TalredPublicErrorBag = { public: TalredPublicError }

export type TalredErrorBag
  = | TalredPublicErrorBag
    | []
    | Record<string, unknown>
    | null

export type TalredApiEnvelope<TData = Record<string, unknown>> = {
  success: boolean
  message: string
  data: TData
  errors: TalredErrorBag
  debug: unknown[]
}

export type TalredApiClientOptions = {
  baseURL: string
  bearerToken?: string
  internalToken?: string
  headers?: HeadersInit
  fetchOptions?: FetchOptions
  onUnauthorized?: (error: TalredApiError) => Promise<void> | void
}
