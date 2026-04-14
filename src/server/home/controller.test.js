import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should provide expected response', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toContain('AI Assure Architecture Governance')
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should show first 10 records on page 1', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/?page=1'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain(
      'Showing <strong>1</strong> to <strong>10</strong>'
    )
  })

  test('Should show records 11 to 20 on page 2', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/?page=2'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain(
      'Showing <strong>11</strong> to <strong>20</strong>'
    )
  })

  test('Should clamp out-of-range page number to last valid page', async () => {
    const { statusCode } = await server.inject({
      method: 'GET',
      url: '/?page=99999'
    })

    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should clamp negative page number to page 1', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/?page=-5'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Showing <strong>1</strong>')
  })

  test('Should default to page 1 when page param is non-numeric', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/?page=abc'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('Showing <strong>1</strong>')
  })
})

describe('#uploadController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should redirect to / after POST upload', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'POST',
      url: '/upload',
      headers: {
        'content-type': 'multipart/form-data; boundary=----testboundary'
      },
      payload:
        '------testboundary\r\nContent-Disposition: form-data; name="templateType"\r\n\r\nSDA\r\n------testboundary--'
    })

    expect(statusCode).toBe(302)
    expect(headers.location).toBe('/')
  })
})
