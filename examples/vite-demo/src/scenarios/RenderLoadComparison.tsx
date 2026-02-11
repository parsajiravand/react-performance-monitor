import { useEffect, useMemo, useState } from "react"
import type { ScenarioComponentProps } from "./types"

type RenderMode = "clean" | "heavy"

interface MetricEntry {
  id: string
  mode: RenderMode
  durationMs: number
  timestamp: number
}

const HEAVY_ITEM_COUNT = 200
const CLEAN_ITEM_COUNT = 24

const createHeavyPayload = (seed: number) => {
  const numbers = Array.from({ length: 80 }, (_, index) => Math.sin(seed + index) * Math.cos(seed * index))
  return numbers.map(value => value.toFixed(2)).join(" ")
}

const RenderLoadComparison = ({ onUpdateHudConfig, hudConfig }: ScenarioComponentProps) => {
  const [mode, setMode] = useState<RenderMode>("clean")
  const [metrics, setMetrics] = useState<MetricEntry[]>([])
  const [pendingMeasurement, setPendingMeasurement] = useState<{ mode: RenderMode; startedAt: number } | null>(null)

  useEffect(() => {
    const needsUpdate = !hudConfig.trackNetwork || !hudConfig.trackLongTasks || !hudConfig.trackFPS
    if (needsUpdate) {
      onUpdateHudConfig({
        trackNetwork: true,
        trackLongTasks: true,
        trackFPS: true
      })
    }
  }, [hudConfig.trackFPS, hudConfig.trackLongTasks, hudConfig.trackNetwork, onUpdateHudConfig])

  useEffect(() => {
    if (!pendingMeasurement) {
      return
    }
    const frameId = requestAnimationFrame(() => {
      const duration = performance.now() - pendingMeasurement.startedAt
      setMetrics(previous => [
        {
          id: `${pendingMeasurement.mode}-${pendingMeasurement.startedAt}`,
          mode: pendingMeasurement.mode,
          durationMs: Math.round(duration),
          timestamp: Date.now()
        },
        ...previous
      ].slice(0, 6))
      setPendingMeasurement(null)
    })
    return () => cancelAnimationFrame(frameId)
  }, [pendingMeasurement])

  const items = useMemo(() => {
    const count = mode === "heavy" ? HEAVY_ITEM_COUNT : CLEAN_ITEM_COUNT
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      title: `Item ${index + 1}`,
      summary: mode === "heavy" ? "Complex analytics payload" : "Lightweight placeholder",
      payload: mode === "heavy" ? createHeavyPayload(index) : "A short description keeps things fast."
    }))
  }, [mode])

  const handleModeChange = (nextMode: RenderMode) => {
    setMode(nextMode)
    setPendingMeasurement({ mode: nextMode, startedAt: performance.now() })
  }

  return (
    <div className="scenario-panel" data-rpm-group="render-load">
      <header>
        <h2>Render Load Comparison</h2>
        <p>
          Compare an optimised render (clean list) against a heavy payload (200 richly formatted items).
          Switch between modes and inspect the HUD timeline for render timings, long tasks, and FPS impact.
        </p>
      </header>

      <section className="control-strip">
        <button
          type="button"
          className={mode === "clean" ? "" : "secondary"}
          data-rpm-id="render-clean-list"
          onClick={() => handleModeChange("clean")}
        >
          Render clean list
        </button>
        <button
          type="button"
          className={mode === "heavy" ? "" : "secondary"}
          data-rpm-id="render-heavy-list"
          onClick={() => handleModeChange("heavy")}
        >
          Render heavy list (200 items)
        </button>
      </section>

      <section className="comparison-grid">
        <div className="metric-card">
          <h3>Latest measurement</h3>
          {metrics.length === 0 ? (
            <p className="empty-state">Switch between modes to record render durations.</p>
          ) : (
            <>
              <p className="metric-card__value">
                {metrics[0].mode === "heavy" ? "Heavy" : "Clean"} · {metrics[0].durationMs} ms
              </p>
              <p className="metric-card__meta">
                Captured at {new Date(metrics[0].timestamp).toLocaleTimeString()}
              </p>
            </>
          )}
        </div>

        <div className="metric-card">
          <h3>Guidance</h3>
          <ul className="guidance-list">
            <li>Watch the profiler timeline: heavy mode should show higher render costs.</li>
            <li>Check for long-task spikes when rendering the heavy list.</li>
            <li>Compare FPS samples—heavy mode may reduce the minimum FPS.</li>
          </ul>
        </div>

        <div className="metric-card">
          <h3>Recent comparisons</h3>
          {metrics.length === 0 ? (
            <p className="empty-state">Measurements appear here after each switch.</p>
          ) : (
            <ul className="metric-history">
              {metrics.map(entry => (
                <li key={entry.id}>
                  <span className="metric-history__mode">{entry.mode === "heavy" ? "Heavy" : "Clean"}</span>
                  <span>{entry.durationMs} ms</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="list-panel">
        <h3>{mode === "heavy" ? "Heavy item payload (200)" : "Clean item payload (24)"}</h3>
        <div className="collapse-list">
          {items.map(item => (
            <details key={item.id} open={mode === "heavy" && item.id < 12}>
              <summary data-rpm-id={`collapse-item-${item.id}`}>{item.title}</summary>
              <p>{item.summary}</p>
              {mode === "heavy" ? (
                <pre>{item.payload}</pre>
              ) : (
                <code>Optimised items keep payloads small and structured.</code>
              )}
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

export default RenderLoadComparison
