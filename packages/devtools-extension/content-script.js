// Content script to bridge between page and extension
// Inject flag so RPM knows DevTools extension is present
// Use an external script to avoid CSP inline script restrictions
const script = document.createElement("script")
script.src = chrome.runtime.getURL("flag.js")
script.onload = () => {
  console.log('RPM DevTools extension detected')
}
document.documentElement.appendChild(script)

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