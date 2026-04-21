import crypto from 'node:crypto'

const DEFAULT_USER_ID = 'TestUser123'
const JWT_SECRET = 'aia-documents-secret-key-for-jwt-32-chars'

function generateJWT(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000)
    })
  ).toString('base64url')

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url')

  return `${header}.${body}.${signature}`
}

export function buildBackendHeaders(request) {
  const userId = request.yar.get('userId') || DEFAULT_USER_ID
  const token = request.yar.get('token') || generateJWT({ sub: userId, name: 'Test User', admin: true })

  return {
    Authorization: `Bearer ${token}`,
    'X-User-Id': userId
  }
}
