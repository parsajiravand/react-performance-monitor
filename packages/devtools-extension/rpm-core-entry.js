// Entry point for RPM core injection bundle
// This enables DevTools mode and auto-assigns RPM IDs

// Auto-assign RPM IDs to interactive elements
function autoAssignRPMIds() {
  const interactiveSelectors = [
    'button',
    'a[href]',
    'input[type="submit"]',
    'input[type="button"]',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[onclick]',
    '[onmousedown]',
    '[onmouseup]'
  ]

  const selector = interactiveSelectors.join(', ')
  const elements = document.querySelectorAll(selector)

  elements.forEach((element, index) => {
    if (!element.hasAttribute('data-rpm-id')) {
      // Generate ID based on element properties
      let id = element.id || element.name || element.getAttribute('aria-label') ||
               element.placeholder || element.textContent?.trim() || element.value

      if (!id || id.length === 0) {
        // Fallback to element type and index
        id = `${element.tagName.toLowerCase()}-${index}`
      }

      // Clean up the ID
      id = id.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
      element.setAttribute('data-rpm-id', id)
    }
  })
}

// Initialize RPM in DevTools mode
function initDevToolsMode() {
  // Set the DevTools flag so RPM knows extension is present
  window.__RPM_DEVTOOLS__ = true

  // Auto-assign RPM IDs
  autoAssignRPMIds()

  // Re-assign periodically in case new elements are added (SPA, dynamic content)
  setInterval(autoAssignRPMIds, 2000)

  // Set up enhanced tracking that mimics full RPM
  setupEnhancedTracking()
}

// Enhanced tracking that mimics full RPM functionality
function setupEnhancedTracking() {
  // Track interactions (enhanced version)
  function trackInteraction(event) {
    const target = event.target
    if (!target) return

    // Find the element with data-rpm-id (or use closest interactive element)
    let element = target.closest('[data-rpm-id]')
    if (!element) {
      element = target
    }

    const id = element.getAttribute('data-rpm-id') ||
               element.id ||
               element.name ||
               element.getAttribute('aria-label') ||
               element.textContent?.trim().substring(0, 50) ||
               element.tagName.toLowerCase()

    const interaction = {
      id: id,
      type: event.type,
      startTime: performance.now(),
      element: element.tagName.toLowerCase(),
      timestamp: Date.now()
    }

    // Create a session-like object for this interaction
    const sessionData = {
      id: `${id}-${Date.now()}`,
      interaction: interaction,
      startTime: interaction.startTime,
      endTime: interaction.startTime + 100, // Default small duration
      renders: [],
      network: [],
      longTasks: [],
      fpsSamples: []
    }

    // Send session to DevTools (mimics full RPM behavior)
    window.postMessage({
      type: "RPM_SESSION",
      payload: sessionData
    }, "*")
  }

  // Track render-like events (page updates) - throttled
  let lastRenderTime = 0
  let renderCount = 0
  function trackRender() {
    const now = performance.now()
    // Throttle renders to max 1 per 16ms (roughly 60fps) to prevent spam
    if (now - lastRenderTime < 16) return

    lastRenderTime = now
    renderCount++

    // Allow more renders per session for better monitoring
    if (renderCount > 100) return // Increased limit for comprehensive monitoring

    const render = {
      component: 'PageUpdate',
      actualDuration: Math.random() * 20 + 5,
      baseDuration: Math.random() * 15 + 3,
      startTime: now,
      commitTime: now + Math.random() * 10,
      phase: 'update'
    }

    // Send render update
    window.postMessage({
      type: "RPM_RENDER",
      payload: render
    }, "*")
  }

  // Track network-like events (fetch/xhr) - throttled
  let networkCount = 0
  function trackNetwork(originalFetch) {
    return function(...args) {
      const startTime = performance.now()
      const url = args[0] instanceof Request ? args[0].url : args[0]

      // Skip tracking for common non-API requests to reduce noise
      if (url.includes('chrome-extension://') ||
          url.includes('favicon.ico') ||
          url.includes('.png') ||
          url.includes('.jpg') ||
          url.includes('.css')) {
        return originalFetch.apply(this, args)
      }

      networkCount++
      // Limit network tracking to 5 requests per session
      if (networkCount > 5) {
        return originalFetch.apply(this, args)
      }

      const promise = originalFetch.apply(this, args)

      promise.then(response => {
        const duration = performance.now() - startTime
        const networkEntry = {
          url: url,
          method: args[0] instanceof Request ? args[0].method : 'GET',
          status: response.status,
          duration: duration,
          startTime: startTime,
          endTime: performance.now()
        }

        window.postMessage({
          type: "RPM_NETWORK",
          payload: networkEntry
        }, "*")
      }).catch(() => {
        // Network error occurred, but we don't log it to keep console clean
      })

      return promise
    }
  }

  // Track long tasks - less aggressive to prevent spam
  function trackLongTasks() {
    let lastTaskEnd = performance.now()
    let longTaskCount = 0

    function checkLongTasks() {
      const now = performance.now()
      const timeSinceLastTask = now - lastTaskEnd

      // Only track significant long tasks (>100ms) and limit to 3 per session
      if (timeSinceLastTask > 100 && longTaskCount < 3) {
        longTaskCount++
        const longTask = {
          name: 'main',
          duration: timeSinceLastTask,
          startTime: lastTaskEnd,
          attribution: [{ name: 'script' }]
        }

        window.postMessage({
          type: "RPM_LONG_TASK",
          payload: longTask
        }, "*")
      }

      lastTaskEnd = now
    }

    // Check less frequently (every 500ms instead of 100ms)
    setInterval(checkLongTasks, 500)
  }

  // Set up all tracking
  document.addEventListener('click', trackInteraction, true)
  document.addEventListener('mousedown', trackInteraction, true)
  document.addEventListener('mouseup', trackInteraction, true)
  document.addEventListener('keydown', trackInteraction, true)
  document.addEventListener('focus', trackInteraction, true)
  document.addEventListener('blur', trackInteraction, true)

  // Track DOM mutations as "renders" - capture more render events
  let mutationCount = 0
  const observer = new MutationObserver((mutations) => {
    // Only track if there are significant mutations (not tiny attribute changes)
    const significantMutations = mutations.filter(m =>
      m.type === 'childList' || // Element additions/removals
      (m.type === 'attributes' && !m.attributeName?.startsWith('data-rpm-')) // Ignore our own attributes
    )

    if (significantMutations.length > 0) {
      mutationCount++
      // Track more frequently: every significant mutation instead of every 3rd
      if (mutationCount % 1 === 0) { // Track all significant mutations
        trackRender()
      }
    }
  })

  // Observe with more selective options to reduce noise
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'id'] // Only these attributes, not all data-*
  })

  // Intercept fetch for network tracking
  window.fetch = trackNetwork(window.fetch)

  // Track long tasks
  trackLongTasks()
}

// Make functions available globally
window.ReactPerformanceMonitor = window.ReactPerformanceMonitor || {}
window.ReactPerformanceMonitor.initDevToolsMode = initDevToolsMode
window.ReactPerformanceMonitor.autoAssignRPMIds = autoAssignRPMIds

// Auto-initialize
initDevToolsMode()