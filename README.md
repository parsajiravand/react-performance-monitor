# react-performance-monitoring

Developer-focused performance monitoring HUD for React applications. Wrap your app with `DevHUD` to automatically capture user interactions, render timings, network calls, long tasks, and FPS in development builds.

**Links:** [Documentation](https://react-performance-monitoring.netlify.app/) · [Live Demo](https://react-performance-monitoring-demo.netlify.app/) · [npm](https://www.npmjs.com/package/react-performance-monitoring) · [GitHub](https://github.com/parsajiravand/react-performance-monitor)

## Features

- Zero-config React Dev HUD with floating performance overlay
- Automatic grouping of renders, network calls, long tasks, and FPS per interaction
- Capture metadata via `data-rpm-id` or `data-rpm-group` attributes
- Safe fetch override with optional Axios integration
- Tree-shakeable core with framework-agnostic trackers
- Development-only execution with SSR guards

## Installation

```bash
npm install react-performance-monitoring
# or
yarn add react-performance-monitoring
```

## Quick start

```tsx
import { DevHUD } from "react-performance-monitoring"

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

IDs are resolved automatically from button text, `id`, `aria-label`, `placeholder`, `data-testid`, or `name`. For explicit labels, use:

```tsx
<button>Load users</button>
<input id="search-filter" placeholder="Search..." />
<button data-rpm-id="custom-label">Submit</button>
```

### Axios integration

```tsx
import { useEffect } from "react"
import axios from "axios"
import { useAttachAxios } from "react-performance-monitoring"

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

- [**Live Demo**](https://react-performance-monitoring-demo.netlify.app/) – Try it in the browser
- [**Documentation**](https://react-performance-monitoring.netlify.app/) – Full guide, API reference, examples
- `examples/vite-demo` – Vite-powered dashboard showcasing grouped interactions, axios integration, and HUD timeline
