export const signoutController = {
  handler(_request, h) {
    return h.view('signout/index', {
      pageTitle: 'Signed out'
    })
  }
}
