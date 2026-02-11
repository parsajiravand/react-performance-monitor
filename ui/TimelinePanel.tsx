import { memo, useMemo } from "react"
import type { PerformanceSession } from "../core/types"

export interface TimelinePanelProps {
  session: PerformanceSession
}

type TimelineItemType = "interaction" | "render" | "network" | "longtask"

interface TimelineItem {
  id: string
  type: TimelineItemType
  label: string
  detail?: string
  offsetMs: number
  durationMs: number
}

const formatMs = (value: number): string => `${Math.round(value)}ms`

const TimelinePanel = ({ session }: TimelinePanelProps) => {
  const items = useMemo<TimelineItem[]>(() => {
    const base = session.startTime
    const interactionItem: TimelineItem = {
      id: session.id,
      type: "interaction",
      label: session.interaction.id,
      detail: session.interaction.type,
      offsetMs: 0,
      durationMs: 0
    }

    const renderItems = session.renders.map<TimelineItem>((render, index) => ({
      id: `${session.id}-render-${index}`,
      type: "render",
      label: render.component,
      detail: `phase: ${render.phase}`,
      offsetMs: render.startTime - base,
      durationMs: render.actualDuration
    }))

    const networkItems = session.network.map<TimelineItem>((entry, index) => ({
      id: `${session.id}-network-${index}`,
      type: "network",
      label: entry.url,
      detail: `${entry.method} • status ${entry.status}`,
      offsetMs: entry.startTime - base,
      durationMs: entry.duration
    }))

    const longTaskItems = session.longTasks.map<TimelineItem>((entry, index) => ({
      id: `${session.id}-longtask-${index}`,
      type: "longtask",
      label: entry.name || "Long Task",
      detail: `${entry.duration.toFixed(1)}ms`,
      offsetMs: entry.startTime - base,
      durationMs: entry.duration
    }))

    return [interactionItem, ...renderItems, ...networkItems, ...longTaskItems].sort(
      (a, b) => a.offsetMs - b.offsetMs
    )
  }, [session])

  return (
    <div className="rpm-timeline">
      <div className="rpm-timeline__heading">Timeline</div>
      <ul className="rpm-timeline__list">
        {items.map(item => (
          <li key={item.id} className={`rpm-timeline__item rpm-timeline__item--${item.type}`}>
            <div className="rpm-timeline__offset">{formatMs(item.offsetMs)}</div>
            <div className="rpm-timeline__content">
              <div className="rpm-timeline__label">{item.label}</div>
              {item.detail ? <div className="rpm-timeline__detail">{item.detail}</div> : null}
            </div>
            <div className="rpm-timeline__duration">{formatMs(item.durationMs)}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default memo(TimelinePanel)
