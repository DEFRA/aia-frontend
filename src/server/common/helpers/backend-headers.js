import crypto from 'node:crypto'
import { config } from '../../../config/config.js'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001'

function generateJWT(payload) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' })
  ).toString('base64url')
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000)
    })
  ).toString('base64url')

  const signature = crypto
    .createHmac('sha256', config.get('jwtSecret'))
    .update(`${header}.${body}`)
    .digest('base64url')

  return `${header}.${body}.${signature}`
}

export function buildBackendHeaders(request) {
  const userId = request.yar.get('userId') || DEFAULT_USER_ID
  const token =
    request.yar.get('token') ||
    generateJWT({ sub: userId, name: 'Guest User', admin: true })

  return {
    Authorization: `Bearer ${token}`,
    'X-User-Id': userId
  }
}
