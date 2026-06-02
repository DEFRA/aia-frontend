const paginatedPaths = ['/home', '/cost', '/policy-documents']

export function cleanPaginationUrl() {
  if (
    paginatedPaths.includes(window.location.pathname) &&
    window.location.search.includes('page=')
  ) {
    window.history.replaceState(null, '', window.location.pathname)
  }
}
