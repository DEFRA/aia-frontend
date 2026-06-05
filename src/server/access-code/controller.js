import { config } from '../../config/config.js'
import { fetchWithLog } from '../common/helpers/fetch-with-log.js'

const PAGE_TITLE = 'Enter access code'
const MAX_LENGTH = 36

function renderForm(h, options = {}) {
  return h.view('access-code/index', {
    pageTitle: PAGE_TITLE,
    isAuthenticationRequired: false,
    ...options
  })
}

/**
 * Calls the core_backend access-code validation endpoint.
 * Backend reads the canonical access code + SHA-256 hash from AWS SSM.
 *
 * Contract:
 *   200 → code accepted
 *   403 → code rejected (or any backend-side failure)
 *   anything else → treat as failure
 */
async function validate(accessCode, logger) {
  const url = `${config.get('backendApiUrl')}/access-code/validate`
  try {
    const res = await fetchWithLog(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode })
      },
      logger
    )
    return res.status === 200
  } catch (err) {
    logger?.error?.(
      { err, url },
      'Access-code validation request to backend failed'
    )
    return false
  }
}

export const accessCodeGetController = {
  options: {
    auth: false
  },
  handler(_request, h) {
    return renderForm(h)
  }
}

export const accessCodePostController = {
  options: {
    auth: false
  },
  async handler(request, h) {
    const { accessCode } = request.payload || {}

    if (!accessCode || accessCode.trim() === '') {
      const errorMessage = 'Enter your access code'
      request.logger.warn(
        { errorMessage },
        'Access code submission rejected: empty value'
      )
      return renderForm(h, { errorMessage })
    }

    if (accessCode.length > MAX_LENGTH) {
      const errorMessage = `Access code must be ${MAX_LENGTH} characters or fewer`
      request.logger.warn(
        { length: accessCode.length, errorMessage },
        'Access code submission rejected: exceeds maximum length'
      )
      return renderForm(h, { errorMessage })
    }

    const accepted = await validate(accessCode, request.logger)

    if (accepted) {
      request.logger.info('Access code accepted by backend')
      request.yar.set('accessGranted', true)
      request.yar.set('lastActivity', Date.now())
      return h.redirect('/home')
    }

    const errorMessage = 'Enter your valid access code'
    request.logger.warn(
      { errorMessage },
      'Access code submission rejected: backend returned non-200 (403 or failure)'
    )
    return renderForm(h, { errorMessage })
  }
}
