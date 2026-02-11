import { memo, useEffect, useMemo, useState } from "react"
import type { PerformanceSession } from "../core/types"
import { usePerformanceState } from "../react/hooks"
import type { HUDPosition, HUDTheme } from "../react/types"
import StatsPanel, { type StatsSummary } from "./StatsPanel"
import TimelinePanel from "./TimelinePanel"
import "./styles.css"

export interface OverlayProps {
  position: HUDPosition
  theme: HUDTheme
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

const Overlay = ({ position, theme }: OverlayProps) => {
  const state = usePerformanceState()
  const [isExpanded, setExpanded] = useState(false)

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
      <StatsPanel summary={summary} isExpanded={isExpanded} onToggleExpand={() => setExpanded(x => !x)} />
      {isExpanded && activeSession ? <TimelinePanel session={activeSession} /> : null}
    </div>
  )
}

export default memo(Overlay)
