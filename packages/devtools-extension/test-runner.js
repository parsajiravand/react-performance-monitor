// Test runner for RPM DevTools Extension
// Run with: node test-runner.js

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 RPM DevTools Extension Test Runner\n')

// Check if extension files exist
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content-script.js',
  'devtools.html',
  'devtools.js',
  'panel-react.html',
  'panel-react.bundle.js'
]

console.log('📁 Checking required files...')
let allFilesExist = true
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Run "npm run build" first.')
  process.exit(1)
}

console.log('\n✅ All required files present\n')

console.log('📋 Manual testing steps:')
console.log('1. Open Chrome and go to chrome://extensions/')
console.log('2. Enable "Developer mode"')
console.log('3. Click "Load unpacked" and select this directory')
console.log('4. Click RPM extension icon → "Open Test Page"')
console.log('5. Press F12 to open DevTools and click the "RPM" tab')
console.log('6. Interact with the test app and watch the performance data')
console.log('7. Test filters, pause/resume, clear, and export buttons\n')

console.log('🔗 Test URLs:')
console.log('• Quick test page: test-quick.html (recommended)')
console.log('• Full test page: test-cdn.html')
console.log('• Test summary: test-summary.html')
console.log('• Local package test: test-with-local-package.html')
console.log('• Installation guide: load-extension.html\n')

console.log('📦 To create distribution ZIP:')
console.log('npm run zip\n')

console.log('✨ Extension ready for testing!')