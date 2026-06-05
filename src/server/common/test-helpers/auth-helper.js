const TEST_ACCESS_CODE = 'test-access-code'

export async function getAuthCookie(
  server,
  accessCode = TEST_ACCESS_CODE
) {
  const originalFetch = global.fetch
  global.fetch = async (url, opts) => {
    if (typeof url === 'string' && url.includes('/access-code/validate')) {
      return new Response(null, { status: 200 })
    }
    return originalFetch(url, opts)
  }
  try {
    const res = await server.inject({
      method: 'POST',
      url: '/',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      payload: `accessCode=${encodeURIComponent(accessCode)}`
    })
    const setCookie = res.headers['set-cookie']
    if (!setCookie) return ''
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]
    return cookies.map((c) => c.split(';')[0]).join('; ')
  } finally {
    global.fetch = originalFetch
  }
}
