import {
  FPSData,
  Interaction,
  LongTaskEntry,
  NetworkEntry,
  PerformanceSession,
  RenderEntry
} from "./types"
import { PerformanceStore } from "./store"

export interface SessionManagerOptions {
  sessionTimeout?: number
  windowRef?: Window
}

export interface SessionManager {
  handleInteraction: (interaction: Interaction) => void
  handleRender: (render: RenderEntry) => void
  handleNetwork: (network: NetworkEntry) => void
  handleLongTask: (task: LongTaskEntry) => void
  handleFPS: (fps: FPSData) => void
  reset: () => void
  dispose: () => void
}

const DEFAULT_TIMEOUT = 2000

const createSessionId = (interaction: Interaction): string =>
  `${interaction.id}-${Math.round(interaction.startTime)}-${Math.random().toString(36).slice(2, 7)}`

export const createSessionManager = (
  store: PerformanceStore,
  options: SessionManagerOptions = {}
): SessionManager => {
  const timeout = options.sessionTimeout ?? DEFAULT_TIMEOUT
  const win = options.windowRef ?? (typeof window !== "undefined" ? window : undefined)

  let activeSession: PerformanceSession | null = null
  let closeTimeout: number | null = null

  const scheduleClose = () => {
    if (!win) {
      return
    }
    if (closeTimeout) {
      win.clearTimeout(closeTimeout)
    }
    closeTimeout = win.setTimeout(() => {
      if (!activeSession) {
        return
      }
      store.setActiveSession(null)
      activeSession = null
    }, timeout)
  }

  const updateActiveSession = (
    updater: (session: PerformanceSession) => PerformanceSession
  ): void => {
    if (!activeSession) {
      return
    }

    const updated = updater(activeSession)
    activeSession = updated
    store.updateSession(updated.id, () => updated)
    scheduleClose()
  }

  const startSession = (interaction: Interaction) => {
    const session: PerformanceSession = {
      id: createSessionId(interaction),
      interaction,
      renders: [],
      network: [],
      longTasks: [],
      fpsSamples: [],
      startTime: interaction.startTime
    }

    activeSession = session
    store.addSession(session)
    scheduleClose()
  }

  return {
    handleInteraction: interaction => {
      if (activeSession) {
        // close out the existing session before starting new one
        store.setActiveSession(null)
        activeSession = null
      }

      store.setLastInteraction(interaction)
      startSession(interaction)

      // Emit session to DevTools extension
      if (typeof window !== "undefined" && window.__RPM_DEVTOOLS__) {
        console.log("RPM: Emitting session to DevTools:", activeSession)
        window.postMessage({
          type: "RPM_SESSION",
          payload: activeSession
        }, "*")
      }
    },
    handleRender: render => {
      console.log("RPM: Session manager handling render", render)
      store.setLatestRender(render)
      updateActiveSession(session => {
        const updatedSession = {
          ...session,
          renders: [...session.renders, render],
          endTime: render.commitTime
        }
        // Emit updated session to DevTools
        if (typeof window !== "undefined" && window.__RPM_DEVTOOLS__) {
          console.log("RPM: Emitting updated session to DevTools (render):", updatedSession)
          window.postMessage({
            type: "RPM_SESSION_UPDATE",
            payload: updatedSession
          }, "*")
        }
        return updatedSession
      })
    },
    handleNetwork: network => {
      console.log("RPM: Session manager handling network", network)
      store.setLatestNetwork(network)
      updateActiveSession(session => {
        const updatedSession = {
          ...session,
          network: [...session.network, network],
          endTime: network.endTime
        }
        // Emit updated session to DevTools
        if (typeof window !== "undefined" && window.__RPM_DEVTOOLS__) {
          console.log("RPM: Emitting updated session to DevTools (network):", updatedSession)
          window.postMessage({
            type: "RPM_SESSION_UPDATE",
            payload: updatedSession
          }, "*")
        }
        return updatedSession
      })
    },
    handleLongTask: task => {
      console.log("RPM: Session manager handling long task", task)
      store.setLatestLongTask(task)
      updateActiveSession(session => {
        const updatedSession = {
          ...session,
          longTasks: [...session.longTasks, task],
          endTime: task.startTime + task.duration
        }
        // Emit updated session to DevTools
        if (typeof window !== "undefined" && window.__RPM_DEVTOOLS__) {
          console.log("RPM: Emitting updated session to DevTools (long task):", updatedSession)
          window.postMessage({
            type: "RPM_SESSION_UPDATE",
            payload: updatedSession
          }, "*")
        }
        return updatedSession
      })
    },
    handleFPS: fps => {
      store.setFPS(fps)
      updateActiveSession(session => ({
        ...session,
        fpsSamples: [...session.fpsSamples, fps],
        endTime: fps.timestamp
      }))
    },
    reset: () => {
      activeSession = null
      if (closeTimeout && win) {
        win.clearTimeout(closeTimeout)
        closeTimeout = null
      }
      store.reset()
    },
    dispose: () => {
      activeSession = null
      if (closeTimeout && win) {
        win.clearTimeout(closeTimeout)
      }
      closeTimeout = null
    }
  }
}
