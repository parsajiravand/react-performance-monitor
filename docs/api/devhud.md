# DevHUD

The main wrapper component that enables performance monitoring. Renders a floating HUD overlay in development and passes children through unchanged in production.

## Import

```tsx
import { DevHUD } from "react-performance-monitoring"
```

## Usage

```tsx
<DevHUD>
  <App />
</DevHUD>
```

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| `children` | `ReactNode` | — | Yes | Your app or root component |
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"top-right"` | No | HUD overlay position |
| `theme` | `"light" \| "dark"` | `"dark"` | No | Visual theme |
| `trackNetwork` | `boolean` | `true` | No | Enable network tracking (fetch + optional axios) |
| `trackLongTasks` | `boolean` | `true` | No | Enable long-task monitoring |
| `trackFPS` | `boolean` | `true` | No | Enable FPS sampling |
| `sessionTimeout` | `number` | `2000` | No | Inactivity timeout (ms) before session closes |
| `forceEnabled` | `boolean` | `false` | No | Show HUD regardless of `NODE_ENV`. Use for deployed demos/previews. |

## Behavior

- **Dev-only**: When `NODE_ENV === "production"` and `forceEnabled` is not set, `DevHUD` renders only `children`; no overlay or trackers are mounted.
- **SSR-safe**: If `window` is undefined (e.g. during SSR), it behaves as in production.
- **Profiler wrapper**: Children are wrapped in a React `Profiler` so render timings are captured.
- **Portal**: The HUD is rendered via `createPortal` into a dedicated container (`[data-rpm-root]`) appended to `document.body`.

## TypeScript

```tsx
import type { DevHUDProps } from "react-performance-monitoring"
```
