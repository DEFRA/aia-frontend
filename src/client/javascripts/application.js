import {
  createAll,
  Button,
  Checkboxes,
  ErrorSummary,
  Radios,
  SkipLink
} from 'govuk-frontend'

import { initUploadHandler } from './upload-handler.js'

createAll(Button)
createAll(Checkboxes)
createAll(ErrorSummary)
createAll(Radios)
createAll(SkipLink)

// Only initialise the upload handler when the upload form is present on the page
if (document.getElementById('uploadForm')) {
  initUploadHandler()
}
