import { memo } from "react"

export interface StatsSummary {
  interactionLabel: string
  totalDurationMs: number | null
  apiDurationMs: number
  renderCount: number
  slowestComponent: { name: string; duration: number } | null
  longTaskCount: number
  fps: number | null
}

export interface StatsPanelProps {
  summary: StatsSummary
  isExpanded: boolean
  onToggleExpand: () => void
}

const formatDuration = (value: number | null): string =>
  value === null ? "—" : `${Math.round(value)}ms`

const formatFPS = (value: number | null): string => (value === null ? "—" : `${value} fps`)

const StatsPanel = ({ summary, isExpanded, onToggleExpand }: StatsPanelProps) => {
  return (
    <div className="rpm-stats">
      <div className="rpm-stats__header">
        <div className="rpm-stats__interaction">
          <span className="rpm-stats__label">Last Interaction</span>
          <span className="rpm-stats__value rpm-stats__value--primary">
            {summary.interactionLabel}
          </span>
        </div>
        <button className="rpm-stats__toggle" type="button" onClick={onToggleExpand}>
          {isExpanded ? "Close Timeline" : "Open Timeline"}
        </button>
      </div>

      <div className="rpm-stats__grid">
        <div className="rpm-stats__item">
          <span className="rpm-stats__label">Total Time</span>
          <span className="rpm-stats__value">{formatDuration(summary.totalDurationMs)}</span>
        </div>
        <div className="rpm-stats__item">
          <span className="rpm-stats__label">API</span>
          <span className="rpm-stats__value">{formatDuration(summary.apiDurationMs)}</span>
        </div>
        <div className="rpm-stats__item">
          <span className="rpm-stats__label">Renders</span>
          <span className="rpm-stats__value">{summary.renderCount}</span>
        </div>
        <div className="rpm-stats__item">
          <span className="rpm-stats__label">Slowest Component</span>
          <span className="rpm-stats__value">
            {summary.slowestComponent
              ? `${summary.slowestComponent.name} (${Math.round(summary.slowestComponent.duration)}ms)`
              : "—"}
          </span>
        </div>
        <div className="rpm-stats__item">
          <span className="rpm-stats__label">Long Tasks</span>
          <span className="rpm-stats__value">{summary.longTaskCount}</span>
        </div>
        <div className="rpm-stats__item">
          <span className="rpm-stats__label">FPS</span>
          <span className="rpm-stats__value">{formatFPS(summary.fps)}</span>
        </div>
      </div>
    </div>
  )
}

export default memo(StatsPanel)
