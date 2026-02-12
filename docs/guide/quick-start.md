# Quick Start

## Minimal Setup

Wrap your app root with `DevHUD`:

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

In development, a floating HUD appears (default: top-right, dark theme) showing:

- **Last Interaction** – ID of the last clicked/typed/submitted element
- **Total Time** – Duration of the current interaction session
- **API** – Total time spent on network calls in that session
- **Renders** – Number of React component renders
- **Slowest Component** – Component with the longest render time
- **Long Tasks** – Count of main-thread blocking tasks
- **FPS** – Current and minimum frame rate

Click **Open Timeline** to see a per-event breakdown (renders, network, long tasks) ordered by time.

## What Happens Under the Hood

1. **Interaction tracking** – Capture-phase listeners for `click`, `input`, `submit` detect user actions.
2. **Session grouping** – Each interaction starts a session; renders, network calls, long tasks, and FPS samples are grouped into that session.
3. **Session timeout** – After a configurable period of inactivity (default 2000ms), the session closes.
4. **React Profiler** – `DevHUD` wraps children in a Profiler and forwards render data to the store.
5. **Network** – `window.fetch` is patched to record requests; optionally attach an Axios instance for axios calls.
6. **Long tasks** – `PerformanceObserver` with `entryTypes: ["longtask"]` records blocking work.
7. **FPS** – A `requestAnimationFrame` loop calculates frames per second over 1s intervals.

## Tagging Interactions

By default, interaction IDs fall back to element `id` or tag name. For clearer labels, add `data-rpm-id` or `data-rpm-group`:

```tsx
<button data-rpm-id="load-users">Load users</button>
```

See [Tracking Tags](/guide/tracking-tags) for details.

## Next Steps

- [Configuration](/guide/configuration) – Position, theme, toggles
- [Axios Integration](/guide/axios-integration) – Track axios requests
- [Examples](/examples/) – Live demo and code samples
