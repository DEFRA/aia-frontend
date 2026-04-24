import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'
import { getAuthCookie } from '../common/test-helpers/auth-helper.js'

describe('#homeController', () => {
  let server
  let authCookie

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    authCookie = await getAuthCookie(server)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/home',
      headers: { cookie: authCookie }
    })

    expect(result).toContain('AI Assure Architecture Governance')
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should show first 10 records on page 1', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/home?page=1',
      headers: { cookie: authCookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain(
      'Showing <strong>1</strong> to <strong>10</strong>'
    )
  })

  test('Should show records 11 to 20 on page 2', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/home?page=2',
      headers: { cookie: authCookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain(
      'Showing <strong>11</strong> to <strong>20</strong>'
    )
  })

  test('Should clamp out-of-range page number to last valid page', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/home?page=99999',
      headers: { cookie: authCookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should clamp negative page number to page 1', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/home?page=-5',
      headers: { cookie: authCookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Showing <strong>1</strong>')
  })

  test('Should default to page 1 when page param is non-numeric', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/home?page=abc',
      headers: { cookie: authCookie }
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Showing <strong>1</strong>')
  })
})

describe('#uploadController', () => {
  let server
  let authCookie

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
    authCookie = await getAuthCookie(server)
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should redirect to /home after POST upload', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: '/upload',
      headers: {
        'content-type': 'multipart/form-data; boundary=----testboundary',
        cookie: authCookie
      },
      payload:
        '------testboundary\r\nContent-Disposition: form-data; name="templateType"\r\n\r\nSDA\r\n------testboundary--'
    })

    expect(statusCode).toBe(302)
    expect(headers.location).toBe('/home')
  })
})
