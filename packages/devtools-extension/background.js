// Background service worker to relay messages between content script and devtools panel
let devtoolsPort = null
let connections = {} // Keep for potential future multi-tab support

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "rpm-devtools") {
    // DevTools panel connection - store globally since there's only one panel
    devtoolsPort = port

    port.onDisconnect.addListener(() => {
      devtoolsPort = null
    })

    port.onMessage.addListener((message) => {
      console.log("DevTools panel message:", message)
    })
  }
})

// Relay messages from content script to devtools panel
chrome.runtime.onMessage.addListener((message, sender) => {
  // Get tab ID safely
  const tabId = sender.tab?.id
  if (!tabId) {
    console.log("Message received without tab ID:", message)
    return
  }

  // Relay to DevTools panel if connected
  if (devtoolsPort) {
    devtoolsPort.postMessage(message)
  }
})