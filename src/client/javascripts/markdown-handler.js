import { marked } from 'marked'

// Configure marked options for better performance and security
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false
})

// Cache DOM elements
let container = null
let source = null

function applyGovUKStyling(element) {
  // Use querySelectorAll once and cache results
  const tables = element.querySelectorAll('table')
  if (tables.length === 0) return

  tables.forEach((table) => {
    table.classList.add('govuk-table')

    // Batch DOM reads and writes
    const thead = table.querySelector('thead')
    const tbody = table.querySelector('tbody')
    const headers = table.querySelectorAll('th')
    const cells = table.querySelectorAll('td')

    if (thead) thead.classList.add('govuk-table__head')
    if (tbody) tbody.classList.add('govuk-table__body')

    headers.forEach((th) => th.classList.add('govuk-table__header'))
    cells.forEach((td) => td.classList.add('govuk-table__cell'))
  })
}

function renderMarkdown() {
  if (!source || !container) return

  const markdownContent = source.textContent
  if (!markdownContent) return

  try {
    // Parse markdown
    const html = marked.parse(markdownContent)

    // Use requestAnimationFrame for smoother rendering
    window.requestAnimationFrame(() => {
      container.innerHTML = html
      applyGovUKStyling(container)
    })
  } catch (error) {
    console.error('Error processing markdown:', error)
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    source = document.getElementById('markdownSource')
    container = document.getElementById('markdownRenderer')
    renderMarkdown()
  })
} else {
  source = document.getElementById('markdownSource')
  container = document.getElementById('markdownRenderer')
  renderMarkdown()
}
