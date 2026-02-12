# Axios Integration

`window.fetch` is tracked automatically. To also track requests made with [Axios](https://github.com/axios/axios), use the `useAttachAxios` hook.

## Basic Setup

1. Create an axios instance (or use the default).
2. Call `useAttachAxios()` inside a component that is a child of `DevHUD`.
3. In `useEffect`, call `attachAxios(instance)` and return the teardown function.

```tsx
import { useEffect } from "react"
import axios from "axios"
import { DevHUD, useAttachAxios } from "react-performance-monitoring"

const axiosInstance = axios.create({
  baseURL: "https://api.example.com",
  timeout: 5000
})

function AxiosTracker() {
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
      <AxiosTracker />
      <App />
    </DevHUD>
  )
}
```

## How It Works

`attachAxios` adds interceptors to the axios instance:

- **Request interceptor** – Stores a start timestamp on the config.
- **Response interceptor** – Computes duration, records url, method, status, and forwards the entry to the session manager.

On unmount (or when `detach()` is called), the interceptors are ejected and the original instance is restored.

## Axios-Compatible Instances

The hook accepts any object that implements the expected interceptor interface:

```ts
{
  interceptors: {
    request: { use: (onFulfilled?, onRejected?) => number; eject: (id) => void }
    response: { use: (onFulfilled?, onRejected?) => number; eject: (id) => void }
  }
}
```

Standard axios instances satisfy this. Custom wrappers may need a compatibility layer.

## Dynamic Attach/Detach

You can attach and detach at runtime. For example, toggling network tracking:

```tsx
function AxiosTracker({ enabled }: { enabled: boolean }) {
  const attachAxios = useAttachAxios()

  useEffect(() => {
    if (!enabled) return
    const detach = attachAxios(axiosInstance)
    return () => detach()
  }, [enabled, attachAxios])

  return null
}
```

## Notes

- `useAttachAxios` must be used inside a component wrapped by `DevHUD`; otherwise it throws.
- Fetch and axios tracking are independent: you can use both, or only fetch, or only axios (with fetch tracking disabled via `trackNetwork={false}` if desired).
- Failed requests (4xx, 5xx) are still recorded with their status codes.
