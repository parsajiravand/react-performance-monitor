# React Performance Monitor Vite Demo

This demo showcases `DevHUD` across multiple focused scenarios. It bundles a local copy of `react-performance-monitoring` via `file:../..`, so build the package before running the app.

**[Try the live demo →](https://react-performance-monitoring-demo.netlify.app/)** · [Documentation](https://react-performance-monitoring.netlify.app/) · [npm](https://www.npmjs.com/package/react-performance-monitoring) · [GitHub](https://github.com/parsajiravand/react-performance-monitor)

## Getting started

```bash
# from the repository root
npm install
npm run build

cd examples/vite-demo
npm install
npm run dev
```

The demo runs on [http://localhost:5174](http://localhost:5174). Use the left-hand sidebar to switch scenarios; each panel describes what to try and which HUD signals to watch.

## Scenario tour

### 1. Basic Interactions

_Goal:_ Show interaction grouping, render timings, and simple data fetches.

- `Load users`: fetches JSONPlaceholder users and groups network + render events.
- `Filter users`: type quickly to inspect React render durations in the timeline.
- `Refresh order`: reverses the list to demonstrate repeated renders under the same identifier.

### 2. Network Stress

_Goal:_ Exercise slow, failing, and timed-out requests plus axios instrumentation control.

- `Slow 200`: 1.2 s request highlights duration vs. status in the HUD.
- `Throw 500`: failing request logs error entries and associated interaction metadata.
- `Timeout 750ms`: uses axios timeout to surface error handling.
- `Detach/Reattach axios`: toggles the axios bridge to prove instrumentation teardown works.

### 3. Long Tasks & FPS

_Goal:_ Visualise main-thread jank and frame-rate sampling.

- Queue 120 ms or 250 ms tasks to populate the long-task tracker.
- Start the FPS stressor to watch minimum FPS drop and recover.
- Combine both to see how sessions record long tasks alongside degraded FPS samples.

### 4. Portals & Session Control

_Goal:_ Demonstrate configurable session windows and interactions inside React portals.

- Adjust the session timeout slider to change how quickly sessions close after inactivity.
- Open the portal modal and trigger submit/cancel flows to confirm identifiers are preserved.
- Fire the modal fetch to verify network calls from portals are grouped with the interaction.

### 5. Render Load Comparison

_Goal:_ Contrast initial render cost between a clean list and a heavy, collapse-based dataset.

- Toggle between `Render clean list` and `Render heavy list` to capture render durations.
- Inspect the HUD timeline for long tasks introduced by the 200-item heavy list.
- Use the FPS and render metrics to decide whether the initial load is acceptable.

Stop the dev server with `Ctrl+C`. Use `npm run build` and `npm run preview` to simulate a production preview of the example itself.
