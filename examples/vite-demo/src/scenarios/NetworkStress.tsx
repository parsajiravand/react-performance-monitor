import { useEffect, useState } from "react"
import { axiosInstance, useAxiosTracking } from "../lib/perfTools"
import type { ScenarioComponentProps } from "./types"

interface RequestLog {
  id: string
  label: string
  status: "pending" | "success" | "error"
  detail?: string
}

const logEntry = (label: string): RequestLog => ({
  id: `${label}-${performance.now().toFixed(2)}`,
  label,
  status: "pending"
})

const NetworkStress = ({ onUpdateHudConfig, hudConfig }: ScenarioComponentProps) => {
  const [logs, setLogs] = useState<RequestLog[]>([])
  const { attach, detach, attached } = useAxiosTracking(axiosInstance)

  useEffect(() => {
    if (!hudConfig.trackNetwork) {
      onUpdateHudConfig({ trackNetwork: true })
    }
  }, [hudConfig.trackNetwork, onUpdateHudConfig])

  useEffect(() => {
    const teardown = attach()
    return () => {
      teardown()
    }
  }, [attach])

  const updateLog = (id: string, patch: Partial<RequestLog>) => {
    setLogs(previous =>
      previous.map(entry => (entry.id === id ? { ...entry, ...patch } : entry))
    )
  }

  const appendLog = (entry: RequestLog) => {
    setLogs(previous => [entry, ...previous].slice(0, 8))
  }

  const fireSlowRequest = async () => {
    const entry = logEntry("Slow 200")
    appendLog(entry)
    try {
      await axiosInstance.get("https://httpstat.us/200?sleep=1200")
      updateLog(entry.id, { status: "success", detail: "Completed in ~1.2s (200)" })
    } catch (error) {
      updateLog(entry.id, {
        status: "error",
        detail: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const fireFailingRequest = async () => {
    const entry = logEntry("Failing 500")
    appendLog(entry)
    try {
      await axiosInstance.get("https://httpstat.us/500")
    } catch {
      updateLog(entry.id, { status: "error", detail: "HTTP 500 from httpstat.us" })
    }
  }

  const fireTimeout = async () => {
    const entry = logEntry("Timeout 408")
    appendLog(entry)
    try {
      await axiosInstance.get("https://httpstat.us/200?sleep=4000", { timeout: 750 })
      updateLog(entry.id, { status: "success", detail: "Unexpected success" })
    } catch (error) {
      updateLog(entry.id, {
        status: "error",
        detail: error instanceof Error ? error.message : "Timed out as expected"
      })
    }
  }

  return (
    <div className="scenario-panel" data-rpm-group="network-stress">
      <header>
        <h2>Network Stress</h2>
        <p>
          Generate slow, failing, and timed-out requests to observe how the network tracker records
          durations, status codes, and grouped interactions.
        </p>
      </header>

      <section className="control-strip">
        <button type="button" data-rpm-id="slow-request" onClick={fireSlowRequest}>
          Slow 200
        </button>
        <button type="button" data-rpm-id="failing-request" onClick={fireFailingRequest}>
          Throw 500
        </button>
        <button type="button" data-rpm-id="timeout-request" onClick={fireTimeout}>
          Timeout 750ms
        </button>
        <button
          type="button"
          className={attached ? "" : "secondary"}
          data-rpm-id="toggle-axios"
          onClick={() => (attached ? detach() : attach())}
        >
          {attached ? "Detach axios tracking" : "Attach axios tracking"}
        </button>
      </section>

      <section className="list-panel">
        {logs.length === 0 ? (
          <p className="empty-state">Trigger a request to populate the activity log.</p>
        ) : (
          <ul className="request-log">
            {logs.map(entry => (
              <li key={entry.id} data-status={entry.status}>
                <div className="request-log__title">{entry.label}</div>
                <div className="request-log__status">{entry.status.toUpperCase()}</div>
                {entry.detail ? <div className="request-log__detail">{entry.detail}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default NetworkStress
