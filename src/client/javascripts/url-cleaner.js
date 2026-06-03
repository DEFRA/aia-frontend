const paginatedPaths = ['/home', '/cost', '/policy-documents']

export function cleanUrl() {
  const { pathname, search } = window.location

  if (paginatedPaths.includes(pathname) && search.includes('page=')) {
    window.history.replaceState(null, '', pathname)
    return
  }

  if (pathname === '/error' && search.includes('status=')) {
    window.history.replaceState(null, '', pathname)
  }
}
