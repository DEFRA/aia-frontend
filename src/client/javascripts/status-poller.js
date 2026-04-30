// Standalone singleton module for polling document processing status.
//
// Usage:
//   import { createPoller } from './status-poller.js'
//   const poller = createPoller({ onResult, onTimeout, onError, intervalMs, maxPolls })
//   poller.start()
//   poller.stop()    // call from onResult callback when no more polling is needed
//   poller.isRunning()
//
// intervalMs and maxPolls are read from config.js via DOM data attributes.
// Only one instance exists at a time. Calling createPoller() a second time
// stops the previous instance before creating the new one.

class StatusPoller {
  #timerId = null
  #pollCount = 0
  #stopped = true
  #intervalMs
  #maxPolls
  #callbacks

  constructor({ intervalMs, maxPolls, ...callbacks }) {
    this.#intervalMs = intervalMs
    this.#maxPolls = maxPolls
    this.#callbacks = callbacks
  }

  start() {
    if (!this.#stopped) return
    this.#stopped = false
    this.#pollCount = 0
    this.#scheduleNext()
  }

  stop() {
    this.#stopped = true
    clearTimeout(this.#timerId)
    this.#timerId = null
  }

  isRunning() {
    return !this.#stopped
  }

  #scheduleNext() {
    if (this.#stopped) return
    this.#timerId = setTimeout(() => this.#tick(), this.#intervalMs)
  }

  async #tick() {
    this.#timerId = null
    if (this.#stopped) return

    this.#pollCount++

    if (this.#pollCount > this.#maxPolls) {
      this.#callbacks.onTimeout?.()
      return
    }

    try {
      const res = await fetch('/api/poll-status')
      if (this.#stopped) return

      if (res.ok) {
        const { processingDocumentIds = [] } = await res.json()
        if (this.#stopped) return
        this.#callbacks.onResult?.(processingDocumentIds)
      } else {
        this.#callbacks.onError?.(new Error(`HTTP ${res.status}`))
      }
    } catch (err) {
      this.#callbacks.onError?.(err)
    }

    this.#scheduleNext()
  }
}

let _instance = null

export function createPoller(callbacks) {
  if (_instance) _instance.stop()
  _instance = new StatusPoller(callbacks)
  return _instance
}

export function getPoller() {
  return _instance
}
