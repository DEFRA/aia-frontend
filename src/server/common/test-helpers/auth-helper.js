export async function getAuthCookie(server, accessCode) {
  if (!accessCode) {
    throw new Error('accessCode is required to obtain an auth cookie')
  }
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
}
