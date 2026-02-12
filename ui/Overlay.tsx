import { memo, useEffect, useMemo, useState } from "react"
import type { PerformanceSession } from "../core/types"
import { usePerformanceState } from "../react/hooks"
import type { HUDPosition, HUDTheme } from "../react/types"
import StatsPanel, { type StatsSummary } from "./StatsPanel"
import TimelinePanel from "./TimelinePanel"
import "./styles.css"

const POSITIONS: HUDPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"]

export interface OverlayProps {
  position: HUDPosition
  theme: HUDTheme
  onPositionChange?: (position: HUDPosition) => void
}

const getNow = (): number =>
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now()

const computeSummary = (session: PerformanceSession | undefined, fps: number | null): StatsSummary => {
  if (!session) {
    return {
      interactionLabel: "No interactions yet",
      totalDurationMs: null,
      apiDurationMs: 0,
      renderCount: 0,
      slowestComponent: null,
      longTaskCount: 0,
      fps
    }
  }

  const totalDuration =
    (session.endTime ?? getNow()) - session.startTime

  const apiDuration = session.network.reduce((sum, entry) => sum + entry.duration, 0)
  const renderCount = session.renders.length
  const slowestRender = session.renders.reduce<StatsSummary["slowestComponent"]>((acc, entry) => {
    if (!acc || entry.actualDuration > acc.duration) {
      return { name: entry.component, duration: entry.actualDuration }
    }
    return acc
  }, null)

  return {
    interactionLabel: session.interaction.id,
    totalDurationMs: totalDuration,
    apiDurationMs: apiDuration,
    renderCount,
    slowestComponent: slowestRender,
    longTaskCount: session.longTasks.length,
    fps
  }
}

const Overlay = ({ position, theme, onPositionChange }: OverlayProps) => {
  const state = usePerformanceState()
  const [isExpanded, setExpanded] = useState(false)
  const [isCollapsed, setCollapsed] = useState(false)

  const activeSession = useMemo<PerformanceSession | undefined>(() => {
    if (!state.sessions.length) {
      return undefined
    }

    if (state.activeSessionId) {
      return state.sessions.find(session => session.id === state.activeSessionId) ?? undefined
    }

    return state.sessions[state.sessions.length - 1]
  }, [state.sessions, state.activeSessionId])

  const summary = useMemo(
    () => computeSummary(activeSession, state.fps?.current ?? null),
    [activeSession, state.fps]
  )

  useEffect(() => {
    if (!activeSession && isExpanded) {
      setExpanded(false)
    }
  }, [activeSession, isExpanded])

  if (isCollapsed) {
    return (
      <button
        type="button"
        className={[
          "rpm-overlay",
          "rpm-overlay--collapsed",
          `rpm-overlay--${position}`,
          `rpm-overlay--${theme}`
        ].join(" ")}
        onClick={() => setCollapsed(false)}
        title="Open performance monitor"
        aria-label="Open performance monitor"
      >
        <span className="rpm-collapsed__label">RPM</span>
      </button>
    )
  }

  return (
    <div
      className={[
        "rpm-overlay",
        `rpm-overlay--${position}`,
        `rpm-overlay--${theme}`,
        isExpanded ? "rpm-overlay--expanded" : ""
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="rpm-overlay__header">
        <span className="rpm-overlay__title">Performance</span>
        <div className="rpm-overlay__actions">
          {onPositionChange ? (
            <div className="rpm-position-picker" role="group" aria-label="Panel position">
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  type="button"
                  className={`rpm-position-btn ${position === pos ? "rpm-position-btn--active" : ""}`}
                  onClick={() => onPositionChange(pos)}
                  title={`Move to ${pos.replace("-", " ")}`}
                  aria-pressed={position === pos}
                  aria-label={`Move to ${pos.replace("-", " ")}`}
                >
                  <span className={`rpm-position-icon rpm-position-icon--${pos}`} aria-hidden />
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className="rpm-overlay__collapse"
            onClick={() => setCollapsed(true)}
            title="Collapse panel"
            aria-label="Collapse panel"
          >
            <span className="rpm-overlay__collapse-icon" aria-hidden>×</span>
          </button>
        </div>
      </div>
      <StatsPanel summary={summary} isExpanded={isExpanded} onToggleExpand={() => setExpanded(x => !x)} />
      {isExpanded && activeSession ? <TimelinePanel session={activeSession} /> : null}
    </div>
  )
}

export default memo(Overlay)
