# Examples

A live Vite demo is available in the repository. It showcases five scenarios that exercise different aspects of the HUD.

## Running the Demo

From the repository root:

```bash
npm install
npm run build

cd examples/vite-demo
npm install
npm run dev
```

The demo runs at `http://localhost:5174` when started locally. Use the sidebar to switch between scenarios.

---

## 1. Basic Interactions

**Goal:** Interaction grouping, render timings, and simple data fetches. IDs are resolved automatically from button text, `id`, and `placeholder`—no `data-rpm-id` needed.

### Actions

- **Load users** – Fetches JSONPlaceholder users; groups network + render events
- **Filter users** – Type to inspect React render durations in the timeline
- **Clear filter** (×) – Uses `aria-label` for the HUD label
- **Refresh order** – Reverses the list; demonstrates repeated renders under the same ID

### Code snippet

```tsx
<button onClick={loadUsers}>Load users</button>
<input id="basic-filter" placeholder="Start typing a name" value={filter} onChange={...} />
<button aria-label="Clear filter" onClick={() => setFilter("")}>×</button>
```

---

## 2. Network Stress

**Goal:** Slow, failing, and timed-out requests; axios attach/detach.

### Actions

- **Slow 200** – ~1.2s request; highlights duration vs. status in the HUD
- **Throw 500** – Failing request; logs error entries and metadata
- **Timeout 750ms** – Axios timeout; surfaces error handling
- **Detach/Reattach axios** – Toggles the axios bridge; proves teardown works

### Code snippet

```tsx
const { attach, detach, attached } = useAxiosTracking(axiosInstance)

useEffect(() => {
  const teardown = attach()
  return () => teardown()
}, [attach])

// Later: detach() to stop tracking; attach() to resume
```

---

## 3. Long Tasks & FPS

**Goal:** Main-thread jank and frame-rate sampling.

### Actions

- **Queue 120ms / 250ms task** – Populates the long-task tracker
- **Start FPS stressor** – Drops frame rate; watch min FPS in the HUD
- Combine both to see sessions with long tasks and degraded FPS

### Code snippet

```tsx
// Long task (blocks main thread)
const heavyWork = () => {
  const start = performance.now()
  while (performance.now() - start < 120) {
    Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER)
  }
}
setTimeout(heavyWork, 0)
```

---

## 4. Portals & Session Control

**Goal:** Configurable session windows; interactions inside React portals.

### Actions

- **Session timeout slider** – Adjust when sessions close after inactivity
- **Open portal modal** – Confirm portal interactions retain `data-rpm-id`
- **Submit / Cancel** – Verify grouping
- **Modal fetch** – Network calls from portals grouped with the interaction

### Code snippet

```tsx
<DevHUD sessionTimeout={sessionTimeout}>
  ...
</DevHUD>

// Inside portal
<button data-rpm-id="modal-submit" onClick={onClose}>Submit</button>
```

---

## 5. Render Load Comparison

**Goal:** Initial render cost: lightweight vs. heavy list.

### Actions

- **Render clean list** – 24 lightweight items
- **Render heavy list** – 200 items with rich payloads
- Inspect HUD timeline for long tasks and render timings
- Compare FPS impact

### Takeaway

Use this to judge whether initial load is acceptable and to identify components that dominate render time.

---

## Repository Structure

```
examples/
└── vite-demo/
    ├── src/
    │   ├── App.tsx           # Scenario selector
    │   ├── scenarios/        # BasicInteractions, NetworkStress, etc.
    │   └── lib/perfTools.ts  # Shared helpers (axios, stressor)
    └── package.json
```
