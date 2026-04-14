/**
 * @vitest-environment jsdom
 */

import { vi } from 'vitest'

// ── Mock govuk-frontend ────────────────────────────────────────────────────────
// application.js calls createAll() at module-level with these components.
// We mock the whole package to avoid real DOM bindings.

const mockCreateAll = vi.fn()

vi.mock('govuk-frontend', () => ({
  createAll: mockCreateAll,
  Button: class Button {},
  Checkboxes: class Checkboxes {},
  ErrorSummary: class ErrorSummary {},
  Radios: class Radios {},
  SkipLink: class SkipLink {}
}))

// ── Mock upload-handler ────────────────────────────────────────────────────────
const mockInitUploadHandler = vi.fn()

vi.mock('./upload-handler.js', () => ({
  initUploadHandler: mockInitUploadHandler
}))

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('application.js', () => {
  beforeEach(() => {
    vi.resetModules()
    mockCreateAll.mockClear()
    mockInitUploadHandler.mockClear()
  })

  test('Should call createAll for each govuk-frontend component', async () => {
    document.body.innerHTML = ''

    await import('./application.js')

    // createAll should have been called 5 times (Button, Checkboxes,
    // ErrorSummary, Radios, SkipLink)
    expect(mockCreateAll).toHaveBeenCalledTimes(5)
  })

  test('Should NOT call initUploadHandler when uploadForm is absent', async () => {
    document.body.innerHTML = '<div>No upload form here</div>'

    await import('./application.js')

    expect(mockInitUploadHandler).not.toHaveBeenCalled()
  })

  test('Should call initUploadHandler when uploadForm is present', async () => {
    document.body.innerHTML = '<form id="uploadForm"></form>'

    await import('./application.js')

    expect(mockInitUploadHandler).toHaveBeenCalledTimes(1)
  })
})
