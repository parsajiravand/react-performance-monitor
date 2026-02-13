// Content script to bridge between page and extension
// Inject flag so RPM knows DevTools extension is present
// Use an external script to avoid CSP inline script restrictions
const script = document.createElement("script")
script.src = chrome.runtime.getURL("flag.js")
script.onload = () => {
  console.log('RPM DevTools extension detected')
}
document.documentElement.appendChild(script)

// Detect React applications and auto-inject RPM
function detectAndInjectRPM() {
  // Comprehensive React detection
  const hasReactGlobal = !!(window.React && window.ReactDOM)
  const hasReactCreateElement = !!(window.React && typeof window.React.createElement === 'function')
  const hasReactElements = !!document.querySelector('[data-reactroot], [data-react-helmet], [data-reactid], [data-react-checksum]')
  const hasReactRoot = !!document.querySelector('#root, #app, #__next, #__nuxt, .App, .app, [id*="root"], [id*="app"]')
  const hasJSX = !!document.querySelector('[data-testid], [data-cy], [data-qa], [aria-label], [role]') // Common with React apps
  const hasReactScripts = !!document.querySelector('script[src*="react"], script[src*="jsx"], script[src*="bundle"]')

  // Check for modern React patterns
  const hasModernReact = !!(
    window.React && (
      window.React.createRoot ||
      window.ReactDOM.createRoot ||
      window.ReactDOM.unstable_createRoot ||
      window.ReactDOM.render // Legacy but still React
    )
  )

  // Check for React DevTools (indicates React app)
  const hasReactDevTools = !!(
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ||
    window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ ||
    document.querySelector('script[src*="react-devtools"]')
  )

  // Check for common React framework patterns
  const hasReactFramework = !!(
    window.next || // Next.js
    window.__NUXT__ || // Nuxt.js
    window.__REDUX_DEVTOOLS_EXTENSION__ || // Redux (common with React)
    window.__APOLLO_CLIENT__ // Apollo (common with React)
  )

  const hasReact = hasReactGlobal || hasReactCreateElement || hasReactElements || hasModernReact || hasReactDevTools

  // Check if RPM DevTools is already initialized
  const hasRPMDevTools = window.__RPM_DEVTOOLS__

  console.log('RPM DevTools: Checking for React...', {
    hasReact,
    hasReactGlobal,
    hasReactCreateElement,
    hasReactElements,
    hasReactRoot,
    hasJSX,
    hasReactScripts,
    hasModernReact,
    hasReactDevTools,
    hasReactFramework,
    hasRPMDevTools,
    reactVersion: window.React?.version || 'unknown',
    url: window.location.href
  })

  // Inject when we can clearly detect React patterns
  const shouldInject = hasReact || hasReactRoot || hasJSX || hasReactDevTools || hasReactFramework

  if (!shouldInject) {
    console.log('RPM DevTools: No React patterns detected yet, will retry...')
    return false // Return false to indicate we should retry
  }

  if (hasRPMDevTools) {
    console.log('RPM DevTools: Already initialized, skipping')
    return true // Return true to indicate we're done
  }

  console.log('RPM DevTools: React-like app detected, injecting RPM core...')

  // Inject RPM package
  const rpmScript = document.createElement("script")
  rpmScript.src = chrome.runtime.getURL("rpm-core.bundle.js")
  rpmScript.onload = () => {
    console.log('RPM DevTools: RPM core injected successfully')
  }
  rpmScript.onerror = (error) => {
    console.error('RPM DevTools: Failed to load RPM core', error)
  }
  document.documentElement.appendChild(rpmScript)

  return true // Return true to indicate injection started
}

// Continuous monitoring for React
function startReactMonitoring() {
  let checkCount = 0
  const maxChecks = 40 // Check for up to ~20 seconds

  console.log('RPM DevTools: Starting React monitoring for up to', maxChecks * 0.5, 'seconds...')

  const checkInterval = setInterval(() => {
    checkCount++
    console.log(`RPM DevTools: React detection attempt ${checkCount}/${maxChecks}`)

    const result = detectAndInjectRPM()

    if (result === true) {
      console.log('RPM DevTools: React monitoring complete')
      clearInterval(checkInterval)
    } else if (checkCount >= maxChecks) {
      console.log('RPM DevTools: Could not detect React patterns after', checkCount, 'attempts')
      console.log('RPM DevTools: If this is a React app, it might be using an unusual setup')
      console.log('RPM DevTools: Try refreshing the page or checking if React DevTools extension is installed')
      clearInterval(checkInterval)
    }
  }, 500) // Check every 500ms

  // Also check immediately
  const immediateResult = detectAndInjectRPM()
  if (immediateResult === true) {
    clearInterval(checkInterval)
  }
}

// Start monitoring when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startReactMonitoring)
} else {
  startReactMonitoring()
}

// Listen for RPM messages from the page
window.addEventListener("message", (event) => {
  if (event.source !== window) return
  if (!event.data?.type?.startsWith("RPM_")) return

  // Relay to background service worker
  try {
    chrome.runtime.sendMessage(event.data)
  } catch (error) {
    // Extension context may be invalidated (extension reloaded)
    // This is normal during development, just ignore
    console.debug('RPM DevTools extension context invalidated, message not sent:', error.message)
  }
})