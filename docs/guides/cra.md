# Create React App

Using React Performance Monitoring with [Create React App](https://create-react-app.dev/) (CRA) requires no special configuration.

## Setup

1. Install the package:

```bash
npm install react-performance-monitoring
```

2. Wrap your app root in `src/App.js` (or `src/App.tsx`):

```tsx
import { DevHUD } from "react-performance-monitoring"

function App() {
  return (
    <DevHUD>
      <div className="App">
        {/* your app content */}
      </div>
    </DevHUD>
  )
}

export default App
```

Alternatively, wrap in `src/index.js`:

```tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { DevHUD } from "react-performance-monitoring"
import App from "./App"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <DevHUD>
      <App />
    </DevHUD>
  </React.StrictMode>
)
```

## Development

```bash
npm start
```

The HUD appears automatically. CRA sets `NODE_ENV=development` when running the dev server.

## Production Build

```bash
npm run build
```

CRA sets `NODE_ENV=production` for production builds. The package strips all monitoring code at runtime.

## Notes

- CRA uses webpack under the hood. The package is tree-shakeable and adds minimal bundle size when included.
- No `eject` or custom webpack config is needed.
- If you use Axios, follow [Axios Integration](/guide/axios-integration) to track those requests.
