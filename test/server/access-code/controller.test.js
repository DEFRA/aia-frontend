import { createServer } from '../../../src/server/server.js'
import { statusCodes } from '../../../src/server/common/constants/status-codes.js'
import { vi } from 'vitest'

function mockBackendValidate(status) {
  return vi.fn(async (url) => {
    if (typeof url === 'string' && url.includes('/access-code/validate')) {
      return new Response(null, { status })
    }
    throw new Error(`Unexpected fetch call to ${url}`)
  })
}

describe('#accessCodeGetController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return 200 and render the access code page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Enter access code')
  })

  test('Should not show sign out link on access code page', async () => {
    const { result } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).not.toContain('Sign out')
  })
})

describe('#accessCodePostController', () => {
  let server
  let originalFetch

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    originalFetch = global.fetch
  })

  afterAll(async () => {
    global.fetch = originalFetch
    await server.stop({ timeout: 0 })
  })

  test('Should show error when access code is empty', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: 'accessCode='
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Enter your access code')
  })

  test('Should show error when access code exceeds 36 characters', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: 'accessCode=' + 'a'.repeat(37)
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Access code must be 36 characters or fewer')
  })

  test('Should show error when access code is whitespace only', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: 'accessCode=%20%20%20'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Enter your access code')
  })

  test('Should show error when payload is missing', async () => {
    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: ''
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Enter your access code')
  })

  test('Should redirect to /home when valid access code is provided', async () => {
    global.fetch = mockBackendValidate(200)

    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: 'accessCode=92a238b4-db01-4aa0-aa0c-85f42aff0887'
    })

    expect(statusCode).toBe(302)
    expect(headers.location).toBe('/home')
  })

  test('Should show error when access code is invalid', async () => {
    global.fetch = mockBackendValidate(403)

    const { result, statusCode } = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: 'accessCode=wrong-code-12345'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Enter your valid access code')
  })

  test('Should set session values on successful login', async () => {
    global.fetch = mockBackendValidate(200)

    const res = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: 'accessCode=92a238b4-db01-4aa0-aa0c-85f42aff0887'
    })

    expect(res.statusCode).toBe(302)

    // Use the session cookie to access a protected route
    const cookie = res.headers['set-cookie']?.[0]?.split(';')[0]
    const homeRes = await server.inject({
      method: 'GET',
      url: '/home',
      headers: { cookie }
    })

    expect(homeRes.statusCode).toBe(statusCodes.ok)
  })
})
