# Configuration

`DevHUD` accepts the following props to customize behavior and appearance.

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"top-right"` | HUD overlay position |
| `theme` | `"light" \| "dark"` | `"dark"` | Visual theme |
| `trackNetwork` | `boolean` | `true` | Enable fetch (and optional axios) tracking |
| `trackLongTasks` | `boolean` | `true` | Enable long-task monitoring |
| `trackFPS` | `boolean` | `true` | Enable FPS sampling |
| `sessionTimeout` | `number` | `2000` | Inactivity timeout (ms) before session closes |

## Example

```tsx
<DevHUD
  position="bottom-left"
  theme="light"
  trackNetwork={true}
  trackLongTasks={true}
  trackFPS={true}
  sessionTimeout={2500}
>
  <App />
</DevHUD>
```

## Position

Controls where the HUD overlay appears:

- `top-left`
- `top-right`
- `bottom-left`
- `bottom-right`

## Theme

- `dark` – Dark background, light text (default)
- `light` – Light background, dark text

## Tracker Toggles

Disable individual trackers to reduce overhead or focus on specific metrics:

```tsx
<DevHUD
  trackNetwork={true}
  trackLongTasks={false}
  trackFPS={true}
>
  <App />
</DevHUD>
```

## Session Timeout

How long (in milliseconds) to wait after the last event before closing the current interaction session. Shorter values create more, shorter sessions; longer values group more activity into a single session.

```tsx
<DevHUD sessionTimeout={5000}>
  <App />
</DevHUD>
```

## TypeScript

Import the props type:

```tsx
import { DevHUD, type DevHUDProps } from "react-performance-monitoring"
```
