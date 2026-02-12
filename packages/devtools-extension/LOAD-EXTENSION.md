# 🚀 Load RPM DevTools Extension

## Quick Setup (2 minutes)

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Select this directory: `packages/devtools-extension/`
   - You should see "React Performance Monitoring" appear in the list

4. **Test the Extension**
   - Click the RPM extension icon in Chrome toolbar
   - Click "Open Test Page" to open a test React app
   - Press F12 to open DevTools
   - Click the "RPM" tab in DevTools
   - Click buttons in the test app
   - Watch live performance data appear!

## ✅ Success Indicators

- Extension loads without errors
- "RPM" tab appears in DevTools
- Clicking test buttons generates events
- Timeline shows visual bars
- Filter controls work
- Export downloads JSON

## 🐛 If Extension Won't Load

**Error: "Could not load icon..."**
- Icons were removed from manifest.json
- This should work now

**Error: "Could not load manifest"**
- Ensure all files are in the extension root directory
- Check that manifest.json is valid JSON

**No RPM tab in DevTools**
- Refresh the DevTools panel (Ctrl+Shift+I)
- Reload the extension in chrome://extensions/

**No performance data**
- Make sure the test page loads react-performance-monitoring
- Check browser console for errors
- Try refreshing the test page

## 📁 Required Files

The extension needs these files in the root directory:
- ✅ `manifest.json`
- ✅ `background.js`
- ✅ `content-script.js`
- ✅ `devtools.html`
- ✅ `devtools.js`
- ✅ `panel-react.html`
- ✅ `panel-react.bundle.js`
- ✅ `popup.html` (optional)
- ✅ `popup.js` (optional)

## 🎯 Next Steps

Once tested locally:
- Run `npm run zip` to create distribution package
- Test the ZIP in a clean Chrome profile
- Submit to Chrome Web Store

## 💡 Pro Tips

- Keep DevTools open when reloading the extension
- Use `test-quick.html` for fastest testing
- Check browser console + DevTools console for errors
- The extension only works on pages with react-performance-monitoring