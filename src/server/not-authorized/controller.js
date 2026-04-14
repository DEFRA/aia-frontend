export const notAuthorizedController = {
  handler(_request, h) {
    return h.view('not-authorized/index', {
      pageTitle: 'Not authorized'
    })
  }
}
