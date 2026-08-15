import { $fetch } from 'ofetch'
import { fallbackZoltaApiEnvelope, ZoltaApiError } from './error.js'
import type { ZoltaApiClientOptions, ZoltaApiEnvelope } from './types.js'

export type ZoltaApiFetchClient = typeof $fetch

export function createZoltaApiClient(options: ZoltaApiClientOptions): ZoltaApiFetchClient {
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
        ? body as ZoltaApiEnvelope
        : fallbackZoltaApiEnvelope(response.status, response.statusText)
      const error = new ZoltaApiError(response.status, envelope)
      if (error.isUnauthorized) await options.onUnauthorized?.(error)
      throw error
    },
  }) as ZoltaApiFetchClient
}

