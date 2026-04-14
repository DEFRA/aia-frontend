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

const ITEMS_PER_PAGE = 10

function buildPageData(requestedPage) {
  const totalItems = uploadsData.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  // Clamp page number to valid range
  const currentPage = Math.min(
    Math.max(parseInt(requestedPage, 10) || 1, 1),
    totalPages
  )

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)
  const pageUploads = uploadsData.slice(startIndex, endIndex)

  const pagination = {
    summary: {
      startItem: startIndex + 1,
      endItem: endIndex,
      totalItems
    },
    items: Array.from({ length: totalPages }, (_, i) => {
      const pageNum = i + 1
      return {
        number: pageNum,
        href: `?page=${pageNum}`,
        current: pageNum === currentPage
      }
    }),
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
