/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { config } from '../../config/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDataRaw = readFileSync(`${__dirname}/uploads.json`, 'utf8')
const uploadsData = JSON.parse(uploadsDataRaw)

/**
 * Build GOV.UK pagination items with ellipsis for large page counts.
 * Always shows: first, last, current, and up to 1 neighbour on each side.
 */
function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 1) return []

  const page = (n) => ({
    number: n,
    href: `?page=${n}`,
    current: n === currentPage
  })
  const ellipsis = () => ({ ellipsis: true })

  // Collect the page numbers that should always be shown
  const visible = new Set([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1
  ])

  const pages = Array.from(visible)
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b)

  const items = []
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) {
      items.push(ellipsis())
    }
    items.push(page(pages[i]))
  }
  return items
}

function buildPageData(requestedPage) {
  const itemsPerPage = config.get('pagination.itemsPerPage')
  const totalItems = uploadsData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Clamp page number to valid range
  const currentPage = Math.min(
    Math.max(parseInt(requestedPage, 10) || 1, 1),
    totalPages
  )

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const pageUploads = uploadsData.slice(startIndex, endIndex)

  const pagination = {
    summary: {
      startItem: startIndex + 1,
      endItem: endIndex,
      totalItems
    },
    items: buildPaginationItems(currentPage, totalPages),
    previous:
      currentPage > 1
        ? {
            href: `?page=${currentPage - 1}`,
            text: 'Previous'
          }
        : null,
    next:
      currentPage < totalPages
        ? {
            href: `?page=${currentPage + 1}`,
            text: 'Next'
          }
        : null
  }

  return { pageUploads, pagination }
}

export const homeController = {
  handler(request, h) {
    const { pageUploads, pagination } = buildPageData(request.query.page)
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home',
      uploads: pageUploads,
      pagination,
      paginationAlignment: config.get('pagination.alignment')
    })
  }
}

export const uploadController = {
  options: {
    payload: {
      multipart: true,
      output: 'stream',
      parse: true,
      maxBytes: 5 * 1024 * 1024 // 5MB
    }
  },
  handler(request, h) {
    // TODO: process uploaded file (request.payload.policyDocx)
    // and redirect to result page or back with error
    return h.redirect('/')
  }
}
