import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { config } from '../../../config/config.js'

const projectRoot = join(fileURLToPath(import.meta.url), '../../../../../')
const LOG_FILE = join(projectRoot, 'backend-api.log')

function prependToFile(entry) {
  let existing = ''
  try {
    existing = readFileSync(LOG_FILE, 'utf8')
  } catch {
    // file does not exist yet — start fresh
  }
  writeFileSync(LOG_FILE, entry + '\n' + existing)
}

function formatEntry(direction, url, method, status, body) {
  const ts = new Date().toISOString()
  const lines = [`[${ts}] ${direction} ${method ?? 'GET'} ${url}`]
  if (direction === '→') {
    lines.push(`  Body     : ${body ?? 'null'}`)
  } else {
    lines.push(`  Status   : ${status}`)
    lines.push(`  Response : ${body ?? 'null'}`)
  }
  lines.push('─'.repeat(80))
  return lines.join('\n')
}

/**
 * Wraps fetch with optional debug logging and file logging, each gated by a flag:
 *
 *  GENERATE_LOG=true      — enables Pino debug logs (request + response)
 *  GENERATE_LOG_FILE=true — also writes entries to backend-api.log (newest at top)
 *                           has no effect when GENERATE_LOG=false
 *
 * @param {string} url
 * @param {RequestInit} options
 * @param {object} logger - Pino logger (request.logger)
 * @returns {Promise<Response>}
 */
export async function fetchWithLog(url, options = {}, logger) {
  const loggingEnabled = config.get('generateLog')

  const method = options.method ?? 'GET'
  const requestBody =
    options.body instanceof FormData ? '[FormData]' : (options.body ?? null)

  if (loggingEnabled) {
    logger?.debug?.({ url, method, body: requestBody }, 'backend request →')

    if (config.get('generateLogFile')) {
      prependToFile(formatEntry('→', url, method, null, requestBody))
    }
  }

  const res = await fetch(url, options)

  if (loggingEnabled) {
    let responseBody = null
    try {
      responseBody = await res.clone().text()
    } catch {
      // response body unreadable — log status only
    }

    logger?.debug?.(
      { url, status: res.status, body: responseBody },
      'backend response ←'
    )

    if (config.get('generateLogFile')) {
      prependToFile(formatEntry('←', url, method, res.status, responseBody))
    }
  }

  return res
}
