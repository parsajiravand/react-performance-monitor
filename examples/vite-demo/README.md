# React Performance Monitor Vite Demo

This demo bootstraps a small dashboard to showcase `DevHUD` in action. It bundles a local copy of `react-performance-monitor` via `file:../..`, so build the package before running the app.

## Getting started

```bash
# from the repository root
npm install
npm run build

cd examples/vite-demo
npm install
npm run dev
```

The demo runs on [http://localhost:5174](http://localhost:5174). Open the HUD to inspect interactions as you trigger them.

## Scenarios to try

- Click **Load users** to fetch data from JSONPlaceholder and trigger network + render events.
- Type into the **Filter** input to see rapid renders grouped under a single interaction.
- Toggle the HUD timeline for a per-event breakdown, including long tasks introduced by a synthetic CPU-bound loop.

Stop the dev server with `Ctrl+C`. Use `npm run build` and `npm run preview` to simulate a production preview of the example itself.
