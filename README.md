# Zolta API Client

Framework-neutral TypeScript client for APIs that use the Zolta HTTP response envelope. It provides consistent request headers, typed envelopes, normalized errors, and authentication failure hooks without depending on Nuxt, Laravel, or Zolta Identity.

## Install

```bash
pnpm add @zoltasoft/api-client
```

## Create a client

```ts
import { createZoltaApiClient, type ZoltaApiEnvelope } from '@zoltasoft/api-client'

const client = createZoltaApiClient({
  baseURL: 'https://api.example.com',
  bearerToken: 'access-token',
  internalToken: 'service-token',
})

const response = await client<ZoltaApiEnvelope<{ user: User }>>('/api/user')
```

The client adds JSON request headers and includes `Authorization` and `X-Internal-Token` only when their values are configured.

## Typed errors

```ts
import { ZoltaApiError } from '@zoltasoft/api-client'

try {
  await client('/api/user')
} catch (error) {
  if (error instanceof ZoltaApiError) {
    error.statusCode
    error.errorCode
    error.fieldErrorsByField
    error.isUnauthorized
    error.isForbidden
    error.isNotFound
    error.isServerError
  }
}
```

Responses that do not use the Zolta envelope are converted into a safe `upstream.error` envelope.

## Authentication hooks

The core package does not own token acquisition or refresh. Integrations can react to a `401` through `onUnauthorized`:

```ts
const client = createZoltaApiClient({
  baseURL,
  bearerToken,
  onUnauthorized: async (error) => {
    await session.clear()
    throw error
  },
})
```

For encrypted Nuxt Identity sessions and one-time refresh/retry behavior, use the adapter exported by `@zoltasoft/identity-consumer-nuxt/runtime`.

## Security

- Instantiate credentialed clients only in trusted server code.
- Do not place service credentials or Identity access tokens in public runtime configuration.
- Use HTTPS for non-local production APIs.
- Treat `onUnauthorized` as lifecycle policy; domain `403` errors are never classified as expired authentication.

