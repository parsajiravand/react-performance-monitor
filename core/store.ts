import {
  FPSData,
  PerformanceSession,
  Interaction,
  RenderEntry,
  NetworkEntry,
  LongTaskEntry
} from "./types"

export interface PerformanceStoreState {
  sessions: PerformanceSession[]
  activeSessionId: string | null
  lastInteraction: Interaction | null
  latestRender: RenderEntry | null
  latestNetwork: NetworkEntry | null
  latestLongTask: LongTaskEntry | null
  fps: FPSData | null
}

export type PerformanceStoreListener = (state: PerformanceStoreState) => void

export interface PerformanceStore {
  getState: () => PerformanceStoreState
  subscribe: (listener: PerformanceStoreListener) => () => void
  addSession: (session: PerformanceSession) => void
  updateSession: (
    sessionId: string,
    updater: (session: PerformanceSession) => PerformanceSession
  ) => void
  setActiveSession: (sessionId: string | null) => void
  setFPS: (fps: FPSData) => void
  setLastInteraction: (interaction: Interaction) => void
  setLatestRender: (render: RenderEntry) => void
  setLatestNetwork: (network: NetworkEntry) => void
  setLatestLongTask: (task: LongTaskEntry) => void
  reset: () => void
}

const defaultState: PerformanceStoreState = {
  sessions: [],
  activeSessionId: null,
  lastInteraction: null,
  latestRender: null,
  latestNetwork: null,
  latestLongTask: null,
  fps: null
}

export const createPerformanceStore = (
  initialState: Partial<PerformanceStoreState> = {}
): PerformanceStore => {
  let state: PerformanceStoreState = { ...defaultState, ...initialState }
  const listeners = new Set<PerformanceStoreListener>()

  const notify = () => {
    listeners.forEach(listener => listener(state))
  }

  const setState = (nextState: PerformanceStoreState) => {
    state = nextState
    notify()
  }

  return {
    getState: () => state,
    subscribe: listener => {
      listeners.add(listener)
      listener(state)
      return () => {
        listeners.delete(listener)
      }
    },
    addSession: session => {
      const sessions = [...state.sessions, session]
      setState({ ...state, sessions, activeSessionId: session.id })
    },
    updateSession: (sessionId, updater) => {
      const sessions = state.sessions.map(session =>
        session.id === sessionId ? updater(session) : session
      )
      setState({ ...state, sessions })
    },
    setActiveSession: sessionId => {
      setState({ ...state, activeSessionId: sessionId })
    },
    setFPS: fps => {
      setState({ ...state, fps })
    },
    setLastInteraction: interaction => {
      setState({ ...state, lastInteraction: interaction })
    },
    setLatestRender: render => {
      setState({ ...state, latestRender: render })
    },
    setLatestNetwork: network => {
      setState({ ...state, latestNetwork: network })
    },
    setLatestLongTask: task => {
      setState({ ...state, latestLongTask: task })
    },
    reset: () => {
      setState({ ...defaultState })
    }
  }
}
