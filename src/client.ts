import { $fetch } from 'ofetch'
import { fallbackTalredApiEnvelope, TalredApiError } from './error.js'
import type { TalredApiClientOptions, TalredApiEnvelope } from './types.js'

export type TalredApiFetchClient = typeof $fetch

export function createTalredApiClient(options: TalredApiClientOptions): TalredApiFetchClient {
  return $fetch.create({
    ...options.fetchOptions,
    baseURL: options.baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
      ...(options.internalToken ? { 'X-Internal-Token': options.internalToken } : {}),
      ...(options.bearerToken ? { Authorization: `Bearer ${options.bearerToken}` } : {}),
    },
    async onResponseError({ response }) {
      const body = response._data
      const envelope = body
        && typeof body === 'object'
        && 'success' in body
        ? body as TalredApiEnvelope
        : fallbackTalredApiEnvelope(response.status, response.statusText)
      const error = new TalredApiError(response.status, envelope)
      if (error.isUnauthorized) await options.onUnauthorized?.(error)
      throw error
    },
  }) as TalredApiFetchClient
}
