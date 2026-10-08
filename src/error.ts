import type {
  TalredApiEnvelope,
  TalredPublicError,
  TalredPublicErrorBag,
  TalredValidationFieldError,
  TalredValidationFieldErrorsMap,
} from './types.js'

function isPublicErrorBag(errors: unknown): errors is TalredPublicErrorBag {
  return typeof errors === 'object'
    && errors !== null
    && !Array.isArray(errors)
    && 'public' in errors
    && typeof (errors as Record<string, unknown>).public === 'object'
    && (errors as Record<string, unknown>).public !== null
    && 'code' in (errors as TalredPublicErrorBag).public
}

function isValidationFieldError(value: unknown): value is TalredValidationFieldError {
  return typeof value === 'object'
    && value !== null
    && 'type' in value
    && 'message' in value
    && typeof (value as Record<string, unknown>).type === 'string'
    && typeof (value as Record<string, unknown>).message === 'string'
}

function isValidationFieldErrorsMap(value: unknown): value is TalredValidationFieldErrorsMap {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeFieldErrors(errors: TalredPublicError['errors']): TalredValidationFieldError[] {
  if (!errors) return []
  if (Array.isArray(errors)) return errors.filter(isValidationFieldError)
  if (!isValidationFieldErrorsMap(errors)) return []

  return Object.entries(errors).flatMap(([type, messages]) => {
    const values = Array.isArray(messages) ? messages : [messages]
    return values
      .filter((message): message is string => typeof message === 'string')
      .map(message => ({ type, message }))
  })
}

export function fallbackTalredApiEnvelope(statusCode: number, statusText = ''): TalredApiEnvelope {
  return {
    success: false,
    message: `Upstream API error (${statusCode})`,
    data: {},
    errors: {
      public: {
        code: 'upstream.error',
        message: statusText || undefined,
      },
    },
    debug: [],
  }
}

export class TalredApiError extends Error {
  readonly statusCode: number
  readonly apiMessage: string
  readonly errorCode: string | undefined
  readonly publicError: TalredPublicError | undefined
  readonly fieldErrors: TalredValidationFieldError[]
  readonly rawEnvelope: TalredApiEnvelope

  constructor(statusCode: number, envelope: TalredApiEnvelope) {
    super(envelope.message || `Upstream API error (${statusCode})`)
    this.name = 'TalredApiError'
    this.statusCode = statusCode
    this.apiMessage = envelope.message ?? ''
    this.rawEnvelope = envelope

    if (isPublicErrorBag(envelope.errors)) {
      this.publicError = envelope.errors.public
      this.errorCode = envelope.errors.public.code
      this.fieldErrors = normalizeFieldErrors(envelope.errors.public.errors)
    } else {
      this.publicError = undefined
      this.errorCode = undefined
      this.fieldErrors = []
    }
  }

  get isValidation(): boolean {
    return this.statusCode === 422 || this.errorCode === 'validation.failed'
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401
      || this.errorCode === 'auth.unauthorized'
      || this.errorCode === 'auth.unauthenticated'
      || this.apiMessage === 'Unauthenticated.'
      || this.apiMessage === 'Unauthorized.'
  }

  get isForbidden(): boolean {
    return this.statusCode === 403 || this.errorCode === 'auth.forbidden'
  }

  get isNotFound(): boolean {
    return this.statusCode === 404
  }

  get isServerError(): boolean {
    return this.statusCode >= 500
  }

  get fieldErrorsByField(): Record<string, string[]> {
    return this.fieldErrors.reduce<Record<string, string[]>>((errors, fieldError) => {
      ;(errors[fieldError.type] ??= []).push(fieldError.message)
      return errors
    }, {})
  }
}
