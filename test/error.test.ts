import { describe, expect, it } from 'vitest'
import { fallbackTalredApiEnvelope, TalredApiError } from '../src/index.js'

describe('TalredApiError', () => {
  it('normalizes validation maps into field errors', () => {
    const error = new TalredApiError(422, {
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
    const unauthorized = new TalredApiError(401, fallbackTalredApiEnvelope(401))
    const forbidden = new TalredApiError(403, fallbackTalredApiEnvelope(403))

    expect(unauthorized.isUnauthorized).toBe(true)
    expect(forbidden.isForbidden).toBe(true)
  })

  it('creates a safe fallback envelope for non-Talred responses', () => {
    expect(fallbackTalredApiEnvelope(502, 'Bad Gateway')).toMatchObject({
      success: false,
      message: 'Upstream API error (502)',
      errors: { public: { code: 'upstream.error', message: 'Bad Gateway' } },
    })
  })
})
