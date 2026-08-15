import { describe, expect, it } from 'vitest'
import { fallbackZoltaApiEnvelope, ZoltaApiError } from '../src/index.js'

describe('ZoltaApiError', () => {
  it('normalizes validation maps into field errors', () => {
    const error = new ZoltaApiError(422, {
      success: false,
      message: 'Validation failed.',
      data: {},
      errors: {
        public: {
          code: 'validation.failed',
          errors: { email: ['Email is required.', 'Email is invalid.'] },
        },
      },
      debug: [],
    })

    expect(error.isValidation).toBe(true)
    expect(error.fieldErrorsByField.email).toEqual(['Email is required.', 'Email is invalid.'])
  })

  it('recognizes authentication and authorization failures', () => {
    const unauthorized = new ZoltaApiError(401, fallbackZoltaApiEnvelope(401))
    const forbidden = new ZoltaApiError(403, fallbackZoltaApiEnvelope(403))

    expect(unauthorized.isUnauthorized).toBe(true)
    expect(forbidden.isForbidden).toBe(true)
  })

  it('creates a safe fallback envelope for non-Zolta responses', () => {
    expect(fallbackZoltaApiEnvelope(502, 'Bad Gateway')).toMatchObject({
      success: false,
      message: 'Upstream API error (502)',
      errors: { public: { code: 'upstream.error', message: 'Bad Gateway' } },
    })
  })
})

