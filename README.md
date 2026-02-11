# react-performance-monitor

Developer-focused performance monitoring HUD for React applications. Wrap your app with `DevHUD` to automatically capture user interactions, render timings, network calls, long tasks, and FPS in development builds.

## Features

- Zero-config React Dev HUD with floating performance overlay
- Automatic grouping of renders, network calls, long tasks, and FPS per interaction
- Capture metadata via `data-rpm-id` or `data-rpm-group` attributes
- Safe fetch override with optional Axios integration
- Tree-shakeable core with framework-agnostic trackers
- Development-only execution with SSR guards

## Installation

```bash
npm install react-performance-monitor
# or
yarn add react-performance-monitor
```

## Quick start

```tsx
import { DevHUD } from "react-performance-monitor"

function AppRoot() {
  return (
    <DevHUD>
      <App />
    </DevHUD>
  )
}
```

## Configuration

```tsx
<DevHUD
  position="top-right"
  theme="dark"
  trackNetwork
  trackLongTasks
  trackFPS
  sessionTimeout={2000}
>
  <App />
</DevHUD>
```

### Tracking tags

Assign human-friendly identifiers to interactive elements:

```tsx
<button data-rpm-id="load-users">Load users</button>
<div data-rpm-group="auth-flow"> … </div>
```

### Axios integration

```tsx
import { useEffect } from "react"
import axios from "axios"
import { useAttachAxios } from "react-performance-monitor"

const axiosInstance = axios.create()

function PerformanceAdapters() {
  const attachAxios = useAttachAxios()

  useEffect(() => {
    const detach = attachAxios(axiosInstance)
    return () => detach()
  }, [attachAxios])

  return null
}

export function AppRoot() {
  return (
    <DevHUD>
      <PerformanceAdapters />
      <App />
    </DevHUD>
  )
}
```

## Development

- `npm run build` – bundle with tsup
- `npm run test` – run Vitest suites
- `npm run test:watch` – watch mode for tests
- `npm run lint` – lint with ESLint
- `npm run typecheck` – TypeScript type checking

Example integrations for CRA, Vite, and Next.js live under `examples/`.
Current demos:

- `examples/vite-demo` – Vite-powered dashboard showcasing grouped interactions, axios integration, and HUD timeline.
