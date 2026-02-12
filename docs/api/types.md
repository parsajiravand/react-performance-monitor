# Types

TypeScript interfaces and types exported or used by the package.

## Interaction

```ts
interface Interaction {
  id: string
  type: string
  startTime: number
  endTime?: number
}
```

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Resolved from `data-rpm-id`, `data-rpm-group`, `id`, `aria-label`, `placeholder`, `data-testid`, `name`, button/link text, or tag name (see [Tracking Tags](/guide/tracking-tags)) |
| `type` | `string` | Event type: `"click"`, `"input"`, `"submit"` |
| `startTime` | `number` | `performance.now()` when the event fired |
| `endTime` | `number?` | Optional; set when session closes |

---

## RenderEntry

```ts
interface RenderEntry {
  component: string
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
  phase: "mount" | "update" | "nested-update"
}
```

| Property | Type | Description |
|----------|------|-------------|
| `component` | `string` | Profiler id (component name) |
| `actualDuration` | `number` | Time spent rendering (ms) |
| `baseDuration` | `number` | Estimated duration without memoization |
| `startTime` | `number` | When render started |
| `commitTime` | `number` | When commit completed |
| `phase` | `string` | `"mount"`, `"update"`, or `"nested-update"` |

---

## NetworkEntry

```ts
interface NetworkEntry {
  url: string
  method: string
  status: number
  duration: number
  startTime: number
  endTime: number
}
```

| Property | Type | Description |
|----------|------|-------------|
| `url` | `string` | Request URL |
| `method` | `string` | HTTP method (e.g. `"GET"`, `"POST"`) |
| `status` | `number` | Response status code; `0` on error |
| `duration` | `number` | Request duration (ms) |
| `startTime` | `number` | Start timestamp |
| `endTime` | `number` | End timestamp |

---

## LongTaskEntry

```ts
interface LongTaskEntry {
  name: string
  duration: number
  startTime: number
  attribution?: LongTaskAttribution[]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Entry name (e.g. `"longtask"`) |
| `duration` | `number` | Task duration (ms) |
| `startTime` | `number` | When the task started |
| `attribution` | `LongTaskAttribution[]?` | Optional attribution data |

---

## FPSData

```ts
interface FPSData {
  current: number
  min: number
  timestamp: number
}
```

| Property | Type | Description |
|----------|------|-------------|
| `current` | `number` | FPS over the last sample window |
| `min` | `number` | Minimum FPS observed since start |
| `timestamp` | `number` | Sample timestamp |

---

## PerformanceSession

```ts
interface PerformanceSession {
  id: string
  interaction: Interaction
  renders: RenderEntry[]
  network: NetworkEntry[]
  longTasks: LongTaskEntry[]
  fpsSamples: FPSData[]
  startTime: number
  endTime?: number
}
```

Groups all events (renders, network, long tasks, FPS) that occurred within the session window following a user interaction.

---

## DevHUDProps

```ts
interface DevHUDProps {
  children: ReactNode
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  theme?: "light" | "dark"
  trackNetwork?: boolean
  trackLongTasks?: boolean
  trackFPS?: boolean
  sessionTimeout?: number
  forceEnabled?: boolean
}
```

Props for the `DevHUD` component. See [Configuration](/guide/configuration) for details.
