import { vi } from 'vitest'
import { createServer } from '../server.js'
import { statusCodes } from '../common/constants/status-codes.js'

describe('#resultController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  describe('mock data mode (default)', () => {
    test('Should return 200 and render the result page', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/result'
      })

      expect(result).toContain('AI Assure Architecture Governance')
      expect(statusCode).toBe(statusCodes.ok)
    })

    test('Should render markdown content from default result.json', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/result'
      })

      expect(statusCode).toBe(statusCodes.ok)
      // page renders with service name in the layout
      expect(result).toContain('AI Assure Architecture Governance')
    })

    test('Should render result2.json when docID matches RESULT2_DOC_ID', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/result?docID=UUID-1234-5678-9012-abcdef123456'
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('AI Assure Architecture Governance')
    })

    test('Should render result.json for an unrecognised docID', async () => {
      const { result, statusCode } = await server.inject({
        method: 'GET',
        url: '/result?docID=unknown-id'
      })

      expect(statusCode).toBe(statusCodes.ok)
      expect(result).toContain('AI Assure Architecture Governance')
    })
  })

  describe('API mode (mockData = false)', () => {
    // We unit-test the controller handler directly by mocking the config module
    // so we can control result.mockData and result.apiUrl independently.

    let configGetMock

    beforeEach(async () => {
      vi.resetModules()

      configGetMock = vi.fn()

      vi.doMock('../../config/config.js', () => ({
        config: { get: configGetMock }
      }))
    })

    afterEach(() => {
      vi.doUnmock('../../config/config.js')
    })

    async function buildHandler() {
      const mod = await import('./controller.js')
      return mod.resultController.handler
    }

    function buildContext() {
      return {
        request: { query: { docID: 'doc-123' }, logger: { error: vi.fn() } },
        h: { view: vi.fn((template, data) => data) }
      }
    }

    test('Should return error content when RESULT_API_URL is not configured', async () => {
      configGetMock.mockImplementation((key) => {
        if (key === 'result.mockData') return false
        if (key === 'result.apiUrl') return null
        return null
      })

      const handler = await buildHandler()
      const { request, h } = buildContext()

      const result = await handler(request, h)

      expect(request.logger.error).toHaveBeenCalled()
      expect(result.markdownContent).toBe('Error loading result content.')
    })

    test('Should return error content when fetch throws a network error', async () => {
      configGetMock.mockImplementation((key) => {
        if (key === 'result.mockData') return false
        if (key === 'result.apiUrl') return 'http://api.example.com/result'
        if (key === 'result.apiTimeoutMs') return 5000
        return null
      })

      const originalFetch = global.fetch
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'))

      const handler = await buildHandler()
      const { request, h } = buildContext()

      const result = await handler(request, h)

      expect(request.logger.error).toHaveBeenCalled()
      expect(result.markdownContent).toBe('Error loading result content.')

      global.fetch = originalFetch
    })

    test('Should return error content when API responds with non-ok status', async () => {
      configGetMock.mockImplementation((key) => {
        if (key === 'result.mockData') return false
        if (key === 'result.apiUrl') return 'http://api.example.com/result'
        if (key === 'result.apiTimeoutMs') return 5000
        return null
      })

      const originalFetch = global.fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => ''
      })

      const handler = await buildHandler()
      const { request, h } = buildContext()

      const result = await handler(request, h)

      expect(request.logger.error).toHaveBeenCalled()
      expect(result.markdownContent).toBe('Error loading result content.')

      global.fetch = originalFetch
    })

    test('Should return API markdown content when fetch succeeds', async () => {
      configGetMock.mockImplementation((key) => {
        if (key === 'result.mockData') return false
        if (key === 'result.apiUrl') return 'http://api.example.com/result'
        if (key === 'result.apiTimeoutMs') return 5000
        return null
      })

      const originalFetch = global.fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '# My Result\n\nSome content here.'
      })

      const handler = await buildHandler()
      const { request, h } = buildContext()

      const result = await handler(request, h)

      expect(result.markdownContent).toBe('# My Result\n\nSome content here.')
      expect(h.view).toHaveBeenCalledWith(
        'result/index',
        expect.objectContaining({ pageTitle: 'Result' })
      )

      global.fetch = originalFetch
    })

    test('Should return fallback message when API returns empty content', async () => {
      configGetMock.mockImplementation((key) => {
        if (key === 'result.mockData') return false
        if (key === 'result.apiUrl') return 'http://api.example.com/result'
        if (key === 'result.apiTimeoutMs') return 5000
        return null
      })

      const originalFetch = global.fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => ''
      })

      const handler = await buildHandler()
      const { request, h } = buildContext()

      const result = await handler(request, h)

      expect(result.markdownContent).toBe('No result content available.')

      global.fetch = originalFetch
    })
  })
})
