// Popup script for RPM DevTools extension
document.addEventListener("DOMContentLoaded", () => {
  const statusDiv = document.getElementById("status")
  const openDevToolsBtn = document.getElementById("open-devtools")
  const testPageBtn = document.getElementById("test-page")

  // Check if we can monitor this page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      statusDiv.textContent = "Extension active - ready to monitor"
      statusDiv.className = "status status--active"
    }
  })

  // Open DevTools instruction
  openDevToolsBtn.addEventListener("click", () => {
    // Extensions cannot programmatically open DevTools
    // Instead, show instructions to the user
    statusDiv.innerHTML = `
      <strong>Instructions:</strong><br>
      1. Press F12 or right-click → Inspect<br>
      2. Click the "RPM" tab in DevTools<br>
      3. Return to this page and interact
    `
    statusDiv.className = "status status--active"

    // Close popup after showing instructions
    setTimeout(() => window.close(), 100)
  })

  // Open test page
  testPageBtn.addEventListener("click", () => {
    const testPageUrl = chrome.runtime.getURL("test-quick.html")
    chrome.tabs.create({ url: testPageUrl })
    window.close() // Close popup
  })

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === "RPM_STATUS") {
      if (message.payload.active) {
        statusDiv.textContent = "Monitoring active page"
        statusDiv.className = "status status--active"
      } else {
        statusDiv.textContent = "No React app detected"
        statusDiv.className = "status status--inactive"
      }
    }
  })

  // Request status from content script
  setTimeout(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getStatus" })
      }
    })
  }, 100)
})