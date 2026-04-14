import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#signoutController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should return 200 and render the signout page', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/signout'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(result).toContain('AI Assure Architecture Governance')
  })
})
