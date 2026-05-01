/**
 * Nunjucks filter: converts a UTC date/time string to UK local time
 * (Europe/London — automatically handles GMT / BST).
 *
 * Accepts ISO 8601 strings (from the API) or "DD/MM/YYYY HH:mm:ss" (mock data).
 * Returns formatted string: "DD/MM/YYYY HH:mm:ss"
 */
export function toUkDateTime(value) {
  if (!value) return ''

  let date

  // Handle "DD/MM/YYYY HH:mm:ss" format from mock data
  const ddMmMatch = String(value).match(
    /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/
  )
  if (ddMmMatch) {
    const [, dd, mm, yyyy, hh, min, ss] = ddMmMatch
    // Treat as UTC
    date = new Date(Date.UTC(+yyyy, +mm - 1, +dd, +hh, +min, +ss))
  } else {
    // ISO 8601 or other parseable format
    // If no timezone indicator, append Z to treat as UTC
    let str = String(value)
    if (!str.match(/[Zz]|[+-]\d{2}:?\d{2}$/)) {
      str = str + 'Z'
    }
    date = new Date(str)
  }

  if (isNaN(date.getTime())) return value // unparseable — return as-is

  return date.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}
