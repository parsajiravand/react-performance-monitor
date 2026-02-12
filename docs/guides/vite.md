# Vite

Using React Performance Monitoring with [Vite](https://vitejs.dev/) is straightforward.

## Setup

1. Install the package:

```bash
npm install react-performance-monitoring
```

2. Wrap your app root. For a typical Vite + React setup:

```tsx
// src/App.tsx or src/main.tsx
import { DevHUD } from "react-performance-monitoring"

function App() {
  return (
    <DevHUD>
      <YourApp />
    </DevHUD>
  )
}
```

If your entry mounts in `main.tsx`:

```tsx
// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { DevHUD } from "react-performance-monitoring"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DevHUD>
      <App />
    </DevHUD>
  </React.StrictMode>
)
```

## Development

Run the dev server. The HUD appears automatically when `NODE_ENV` is not `production` (Vite sets this for you in dev mode):

```bash
npm run dev
```

## Production Build

When you run `npm run build`, Vite sets `NODE_ENV=production`. The package detects this and does not mount the HUD or any trackers, so there is no runtime overhead.

## Demo

A full Vite demo is available in the repository:

- **Path**: `examples/vite-demo`
- **Run**: `npm install` then `npm run dev` from that directory
- **Scenarios**: Basic Interactions, Network Stress, Long Tasks & FPS, Portals & Session, Render Load Comparison
