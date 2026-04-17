export function openWipModal() {
  const modal = document.getElementById('wipModal')
  if (modal) modal.classList.add('is-open')
}

export function initWipModal() {
  const modal = document.getElementById('wipModal')
  if (!modal) return

  function openModal() {
    modal.classList.add('is-open')
  }

  function closeModal() {
    modal.classList.remove('is-open')
  }

  // Open modal on every "View Results" link click
  document.querySelectorAll('.js-open-wip-modal').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault()
      openModal()
    })
  })

  // Close via the Close button
  const closeBtn = document.getElementById('wipModalClose')
  if (closeBtn) closeBtn.addEventListener('click', closeModal)

  // Close by clicking the overlay backdrop
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal()
  })

  // Close with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal()
  })
}
