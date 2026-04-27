import { config } from '../../../config/config.js'

/**
 * Submits the access code form and returns the session cookie string
 * so that subsequent inject calls can access protected routes.
 */
export async function getAuthCookie(server) {
  const accessCode = config.get('accessCode')
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
