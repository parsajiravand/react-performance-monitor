import { useEffect, useState } from "react"
import { triggerLongTask, useFrameStressor } from "../lib/perfTools"
import type { ScenarioComponentProps } from "./types"

const LongTaskAndFPS = ({ onUpdateHudConfig, hudConfig }: ScenarioComponentProps) => {
  const [stressorActive, setStressorActive] = useState(false)
  const [latestLongTask, setLatestLongTask] = useState<string | null>(null)

  useFrameStressor(stressorActive, { workMs: 18, restFrames: 0 })

  useEffect(() => {
    if (!hudConfig.trackLongTasks || !hudConfig.trackFPS) {
      onUpdateHudConfig({ trackLongTasks: true, trackFPS: true })
    }
  }, [hudConfig.trackFPS, hudConfig.trackLongTasks, onUpdateHudConfig])

  const handleLongTask = (durationMs: number) => {
    triggerLongTask(durationMs)
    setLatestLongTask(`Queued standalone long task (~${durationMs}ms)`)
  }

  return (
    <div className="scenario-panel" data-rpm-group="longtask-fps">
      <header>
        <h2>Long Tasks &amp; FPS</h2>
        <p>
          Stress the main thread to visualise long-task tracking and fluctuating frame rates in the
          HUD. Combine actions to inspect how sessions capture CPU spikes.
        </p>
      </header>

      <section className="control-strip">
        <button
          type="button"
          data-rpm-id="queue-longtask-120"
          onClick={() => handleLongTask(120)}
        >
          Queue 120ms task
        </button>
        <button
          type="button"
          data-rpm-id="queue-longtask-250"
          onClick={() => handleLongTask(250)}
        >
          Queue 250ms task
        </button>
        <button
          type="button"
          data-rpm-id="toggle-fps-stressor"
          className={stressorActive ? "" : "secondary"}
          onClick={() => setStressorActive(previous => !previous)}
        >
          {stressorActive ? "Stop FPS stressor" : "Start FPS stressor"}
        </button>
      </section>

      <section className="list-panel">
        <h3>What to observe</h3>
        <ul className="guidance-list">
          <li>When queuing tasks, the long-task tracker should log blocking work instantly.</li>
          <li>While the FPS stressor runs, compare current vs. min FPS values in the HUD widgets.</li>
          <li>
            Combine both controls to see how the session groups renders, tasks, and FPS samples.
          </li>
        </ul>
        {latestLongTask ? <p className="status-inline">{latestLongTask}</p> : null}
      </section>
    </div>
  )
}

export default LongTaskAndFPS
