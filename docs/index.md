# React Performance Monitoring

Developer-focused performance monitoring HUD for React applications. Wrap your app with `DevHUD` to automatically capture user interactions, render timings, network calls, long tasks, and FPS in development builds.

## Features

- **Zero-config** – Works out of the box; wrap your app and start observing
- **Interaction-aware sessions** – Groups renders, network, long tasks, and FPS per user interaction
- **Automatic interaction labels** – Resolved from button text, `id`, `aria-label`, `placeholder`, `data-testid`, or `data-rpm-id` / `data-rpm-group`
- **Network instrumentation** – Built-in fetch override; optional Axios integration
- **Dev-only** – No production bundle pollution; stripped when `NODE_ENV === "production"`
- **Framework-agnostic core** – Works with Vite, CRA, Next.js, and more
- **Tree-shakeable** – Minimal footprint when bundled

## Quick Start

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

A floating HUD appears in development, showing Last Interaction, Total Time, API duration, Render count, Slowest Component, Long Tasks, and FPS. Expand the timeline to see a per-event breakdown.

## What Gets Tracked

| Tracker | Captures |
|---------|----------|
| **Interactions** | click, input, submit (auto-resolved or `data-rpm-id` / `data-rpm-group`) |
| **Renders** | React Profiler data: component name, actualDuration, phase |
| **Network** | fetch calls; optionally axios via `useAttachAxios` |
| **Long tasks** | Main-thread blocking work (50ms+) via PerformanceObserver |
| **FPS** | Current and minimum frame rate over 1s windows |

## Next Steps

- [Quick Start](/guide/quick-start) – Minimal setup and first run
- [Configuration](/guide/configuration) – Position, theme, toggles, session timeout
- [Tracking Tags](/guide/tracking-tags) – Automatic resolution and `data-rpm-id` / `data-rpm-group`
- [API Reference](/api/devhud) – DevHUD, hooks, and types
