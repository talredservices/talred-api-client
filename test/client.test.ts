import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createZoltaApiClient, ZoltaApiError } from '../src/index.js'

const servers: Array<ReturnType<typeof createServer>> = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
  })))
})

async function serve(handler: (request: IncomingMessage, response: ServerResponse) => void): Promise<string> {
  const server = createServer(handler)
  servers.push(server)
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Test server did not bind to a TCP port.')
  return `http://127.0.0.1:${address.port}`
}

describe('createZoltaApiClient', () => {
  it('adds configured service and bearer credentials', async () => {
    const baseURL = await serve((request, response) => {
      response.setHeader('content-type', 'application/json')
      response.end(JSON.stringify({
        success: true,
        message: 'ok',
        data: {
          authorization: request.headers.authorization,
          internalToken: request.headers['x-internal-token'],
        },
        errors: [],
        debug: [],
      }))
    })
    const client = createZoltaApiClient({ baseURL, bearerToken: 'access-token', internalToken: 'service-token' })
    const response = await client<{ data: { authorization: string, internalToken: string } }>('/profile')

    expect(response.data).toEqual({ authorization: 'Bearer access-token', internalToken: 'service-token' })
  })

  it('throws a typed error and invokes the unauthorized hook', async () => {
    const onUnauthorized = vi.fn()
    const baseURL = await serve((_request, response) => {
      response.statusCode = 401
      response.setHeader('content-type', 'application/json')
      response.end(JSON.stringify({
        success: false,
        message: 'Unauthenticated.',
        data: {},
        errors: { public: { code: 'auth.unauthenticated' } },
        debug: [],
      }))
    })
    const client = createZoltaApiClient({ baseURL, onUnauthorized })

    await expect(client('/profile')).rejects.toBeInstanceOf(ZoltaApiError)
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
