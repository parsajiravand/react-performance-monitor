# React Performance Monitoring DevTools Extension

Chrome DevTools extension with React-based UI for monitoring React app performance per interaction.

## Features

- **React-powered UI**: Modern, interactive DevTools panel built with React
- **Real-time monitoring**: Live interaction, render, network, and long task tracking
- **Timeline visualization**: Visual timeline showing event timing and duration
- **Advanced filtering**: Filter by event type (interactions, renders, network, long tasks)
- **Session management**: Track complete user interaction sessions
- **Data export**: Export performance data as JSON
- **Recording control**: Pause/resume monitoring as needed
- **Zero-config integration**: Automatic detection of react-performance-monitoring

## Installation

### Option 1: Load Unpacked (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/parsajiravand/react-performance-monitor.git
   cd react-performance-monitor/packages/devtools-extension
   ```

2. **Install dependencies and build**
   ```bash
   npm install
   npm run build
   ```

3. **Open Chrome extensions page**
   ```
   chrome://extensions/
   ```

4. **Enable Developer Mode** (toggle in top-right)

5. **Load the extension**
   - Click "Load unpacked"
   - Select the `packages/devtools-extension/` directory

### Option 2: Build for Distribution

```bash
npm run build  # Build the React panel
npm run zip    # Creates rpm-devtools-extension.zip for Chrome Web Store upload
```

### Option 3: Chrome Web Store (Future)

Once published to the Chrome Web Store, users can install directly from there.

## Usage

1. **Install the extension** as described above
2. **Open a React app** that uses react-performance-monitoring
3. **Open Chrome DevTools** (F12 or right-click → Inspect)
4. **Click the "RPM" tab** at the top of DevTools
5. **Interact with your app** - see real-time performance data

### Panel Features

- **Recording Toggle**: Pause/resume performance monitoring
- **Event Filtering**: Show all events or filter by type
- **Timeline View**: Visual representation of event timing
- **Session Summary**: Overview of renders, network calls, and long tasks
- **Data Export**: Download performance data as JSON
- **Clear Data**: Reset the current session data

## Testing

- **Local test page**: Open `test-with-local-package.html` in Chrome
- **Extension popup**: Click the RPM icon in Chrome toolbar
- **DevTools console**: Look for "RPM DevTools extension detected" messages

## Architecture

- **Content Script** (`content-script.js`): Bridges page messages to extension
- **Background Service Worker** (`background.js`): Relays messages between content script and DevTools panel
- **DevTools Panel** (`panel-react.html` + `panel-react.bundle.js`): React-based UI for displaying performance data

## Requirements

- **Chrome 88+** (Manifest V3)
- **react-performance-monitoring** package installed on target pages
- **DevTools access** to view the RPM panel

## Troubleshooting

- **Extension not loading?** Ensure all files are in the extension root directory
- **No data in RPM panel?** The page must have react-performance-monitoring installed
- **DevTools tab missing?** Refresh DevTools after loading the extension
- **Build issues?** Run `npm install` and `npm run build` first

## Development

### File Structure
```
packages/devtools-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for messaging
├── content-script.js      # Page script injection
├── devtools.html          # DevTools entry point
├── devtools.js            # Creates RPM DevTools panel
├── panel-react.html       # React panel UI template
├── panel-react.js         # React panel source
├── panel-react.bundle.js  # Built React panel (generated)
├── panel-timeline.js      # Timeline component
├── popup.html             # Extension popup (optional)
├── popup.js               # Popup functionality (optional)
├── test-*.html            # Test pages for development
├── example-*.html         # Example implementations
├── load-extension.html    # Installation instructions
├── icons/                 # Extension icons
├── webpack.config.js      # Build configuration
├── .babelrc              # Babel configuration
├── package.json          # Extension metadata
└── README.md             # This file
```

### Making Changes

1. Edit the React components in `panel-react.js`
2. Run `npm run build` to bundle the panel
3. Reload the extension in Chrome (`chrome://extensions/`)
4. Test with a React app using react-performance-monitoring

### Build Process

The extension uses Webpack to bundle the React panel (including React/ReactDOM):

```bash
npm run build         # Production build (~142KB)
npm run build:dev     # Development build with watch mode
npm run zip          # Create distribution ZIP
```

The bundle includes React and ReactDOM to comply with DevTools CSP restrictions.

## Contributing

1. Make changes to the source files
2. Test with `npm run build` and reload in Chrome
3. Update documentation as needed
4. Submit a pull request

## License

MIT - same as the main react-performance-monitoring package.