# FAQ

## Is this package safe for production?

Yes. The package checks `process.env.NODE_ENV` and only mounts the HUD and trackers when `NODE_ENV !== "production"`. In production builds, `DevHUD` renders only its children; no overlay, no listeners, no network patching.

## Does it work with SSR (Next.js, etc.)?

Yes. All trackers guard against `typeof window === "undefined"`. During server-side rendering, `DevHUD` simply passes through its children. The overlay and trackers only run in the browser.

## Does it add bundle size in production?

Minimal. The package is tree-shakeable (`"sideEffects": false`). When `NODE_ENV` is production, the monitoring code paths are not executed. Dead-code elimination can remove unused branches depending on your bundler.

## I get "usePerformanceMonitor must be used within a DevHUD component"

Hooks like `usePerformanceMonitor`, `useAttachAxios`, and `usePerformanceState` require the `PerformanceMonitorProvider` context, which is provided by `DevHUD`. Ensure the component using the hook is a descendant of `DevHUD`:

```tsx
<DevHUD>
  <MyComponent />  // Can use useAttachAxios, etc.
</DevHUD>
```

## The HUD doesn't appear

Check:

1. **Environment** – Are you running in development? (`NODE_ENV` should not be `"production"`.)
2. **Browser** – The package requires `window` and `document`; it won't run during SSR.
3. **Build** – If using a custom build, ensure `NODE_ENV` is set correctly for dev.
4. **Deployed demo** – For production builds where you want the HUD (e.g. a live demo), use `forceEnabled`:

   ```tsx
   <DevHUD forceEnabled>
     <App />
   </DevHUD>
   ```

## How do I deploy the demo with the HUD visible?

Production builds set `NODE_ENV=production`, so the HUD is hidden by default. Use both:

1. **`forceEnabled` prop** – Pass it to `DevHUD`:

   ```tsx
   <DevHUD forceEnabled>
     <DemoApp />
   </DevHUD>
   ```

2. **Vite define** (if using Vite) – Add to `vite.config.ts` so the HUD stays enabled in production bundles:

   ```ts
   define: {
     "process.env.RPM_FORCE_ENABLED": JSON.stringify("true")
   }
   ```

The example app in `examples/vite-demo` uses both so the HUD appears when deployed to Netlify, Vercel, etc.

### Renders show 0 in production Timeline

React's `<Profiler>` `onRender` callback is disabled in production builds by default. To capture render timings in a deployed demo, use React's profiling build. In Vite, add to `vite.config.ts`:

```ts
resolve: {
  alias: {
    "react-dom$": "react-dom/profiling"
  }
}
```

This enables the Profiler in production at the cost of minor overhead. The demo's Vite config includes this alias so the Timeline shows renders when deployed.

## Does it patch fetch? Will it break my app?

Yes, it patches `window.fetch` when `trackNetwork` is true. The patch wraps the original fetch, records the request, and returns the original response. It does not modify request or response bodies. When `DevHUD` unmounts, the original fetch is restored.

## Can I use it with Axios instead of fetch?

Yes. Use `useAttachAxios` to attach interceptors to your axios instance. Fetch and axios tracking can run in parallel; both are recorded in the same session.

## What's the performance overhead?

Designed to add &lt;5ms per interaction. The package avoids deep cloning, uses passive observers where possible, and debounces session logic. In production, there is no overhead.

## Does it work with React 17?

The package targets React 18+. It uses `useSyncExternalStore` and may rely on React 18 behaviors. React 17 is not officially supported.

## How do I disable specific trackers?

Use the `trackNetwork`, `trackLongTasks`, and `trackFPS` props on `DevHUD`:

```tsx
<DevHUD trackNetwork={true} trackLongTasks={false} trackFPS={true}>
  <App />
</DevHUD>
```

## Long tasks don't show up

The long-task tracker uses `PerformanceObserver` with `entryTypes: ["longtask"]`. Browser support varies; Chrome supports it. Tasks must block the main thread for at least ~50ms to be reported. Ensure `trackLongTasks={true}` and that you're in a supported browser.
