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

  tables.forEach((table) => {
    table.classList.add('govuk-table')

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

/**
 * Wrap each h2 section in a GOV.UK Details (collapsible) component.
 * Collects all sibling elements between one h2 and the next h2/h1
 * and wraps them in <details class="govuk-details"><summary>...</summary><div>...</div></details>
 */
function wrapSectionsInDetails(element) {
  const children = Array.from(element.children)
  const fragment = document.createDocumentFragment()
  let currentDetails = null
  let currentContent = null

  children.forEach((child) => {
    const tagName = child.tagName?.toLowerCase()

    if (tagName === 'h2') {
      // Close previous details if open
      if (currentDetails) {
        fragment.appendChild(currentDetails)
        currentDetails = null
        currentContent = null
      }

      // Create new GOV.UK details component
      currentDetails = document.createElement('details')
      currentDetails.classList.add('govuk-details')

      // Open "Final Evaluation Summary" by default
      if (
        child.textContent
          .trim()
          .toLowerCase()
          .includes('final evaluation summary')
      ) {
        currentDetails.setAttribute('open', '')
      }

      const summary = document.createElement('summary')
      summary.classList.add('govuk-details__summary')

      const summaryText = document.createElement('span')
      summaryText.classList.add('govuk-details__summary-text')
      summaryText.textContent = child.textContent

      summary.appendChild(summaryText)
      currentDetails.appendChild(summary)

      currentContent = document.createElement('div')
      currentContent.classList.add('govuk-details__text')
      currentDetails.appendChild(currentContent)
    } else if (tagName === 'h1') {
      // h1 stays outside any collapsible section
      if (currentDetails) {
        fragment.appendChild(currentDetails)
        currentDetails = null
        currentContent = null
      }
      fragment.appendChild(child)
    } else if (currentContent) {
      currentContent.appendChild(child)
    } else {
      fragment.appendChild(child)
    }
  })

  // Append last open section
  if (currentDetails) {
    fragment.appendChild(currentDetails)
  }

  element.innerHTML = ''
  element.appendChild(fragment)
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
      wrapSectionsInDetails(container)
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
