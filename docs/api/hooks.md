# Hooks

All hooks must be used inside a component wrapped by `DevHUD`. Otherwise they throw.

## usePerformanceMonitor

Returns the full context value: `store`, `attachAxios`, and `isEnabled`.

```tsx
const { store, attachAxios, isEnabled } = usePerformanceMonitor()
```

**Returns:** `PerformanceMonitorContextValue`

| Property | Type | Description |
|----------|------|-------------|
| `store` | `PerformanceStore` | Pub/sub store with `getState`, `subscribe`, etc. |
| `attachAxios` | `(instance) => () => void` | Attach axios interceptors; returns teardown |
| `isEnabled` | `boolean` | Whether monitoring is active (dev + browser) |

---

## usePerformanceState

Subscribes to the performance store and returns the current state. Re-renders when the store updates.

```tsx
const state = usePerformanceState()
```

**Returns:** `PerformanceStoreState`

| Property | Type | Description |
|----------|------|-------------|
| `sessions` | `PerformanceSession[]` | All recorded sessions |
| `activeSessionId` | `string \| null` | ID of the current session |
| `lastInteraction` | `Interaction \| null` | Most recent interaction |
| `latestRender` | `RenderEntry \| null` | Most recent render entry |
| `latestNetwork` | `NetworkEntry \| null` | Most recent network entry |
| `latestLongTask` | `LongTaskEntry \| null` | Most recent long task |
| `fps` | `FPSData \| null` | Latest FPS sample |

---

## usePerformanceSessions

Convenience hook that returns `state.sessions`.

```tsx
const sessions = usePerformanceSessions()
```

**Returns:** `PerformanceSession[]`

---

## useLatestInteraction

Convenience hook that returns `state.lastInteraction`.

```tsx
const interaction = useLatestInteraction()
```

**Returns:** `Interaction | null`

---

## useLatestFPS

Convenience hook that returns `state.fps`.

```tsx
const fps = useLatestFPS()
```

**Returns:** `FPSData | null`

---

## usePerformanceEnabled

Returns whether the monitor is enabled (dev mode + browser).

```tsx
const enabled = usePerformanceEnabled()
```

**Returns:** `boolean`

---

## useAttachAxios

Returns the `attachAxios` function for wiring axios instances.

```tsx
const attachAxios = useAttachAxios()

useEffect(() => {
  const detach = attachAxios(axiosInstance)
  return () => detach()
}, [attachAxios])
```

**Returns:** `(instance: AxiosLikeInstance) => () => void`

See [Axios Integration](/guide/axios-integration) for usage details.
