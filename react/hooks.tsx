import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useSyncExternalStore
} from "react"
import type { PerformanceStore, PerformanceStoreState } from "../core/store"
import type { PerformanceSession, FPSData, Interaction, TrackerCleanup } from "../core/types"
import type { AxiosLikeInstance } from "../core/network-tracker"

export interface PerformanceMonitorContextValue {
  store: PerformanceStore
  attachAxios: (instance: AxiosLikeInstance) => TrackerCleanup
  isEnabled: boolean
}

const PerformanceMonitorContext = createContext<PerformanceMonitorContextValue | null>(null)

export const PerformanceMonitorProvider = ({
  value,
  children
}: {
  value: PerformanceMonitorContextValue
  children: ReactNode
}) => (
  <PerformanceMonitorContext.Provider value={value}>
    {children}
  </PerformanceMonitorContext.Provider>
)

export const usePerformanceMonitor = (): PerformanceMonitorContextValue => {
  const context = useContext(PerformanceMonitorContext)
  if (!context) {
    throw new Error("usePerformanceMonitor must be used within a DevHUD component")
  }
  return context
}

export const usePerformanceState = (): PerformanceStoreState => {
  const { store } = usePerformanceMonitor()
  return useSyncExternalStore(store.subscribe, store.getState, store.getState)
}

export const usePerformanceSessions = (): PerformanceSession[] => {
  const state = usePerformanceState()
  return state.sessions
}

export const useLatestInteraction = (): Interaction | null => {
  const state = usePerformanceState()
  return state.lastInteraction
}

export const useLatestFPS = (): FPSData | null => {
  const state = usePerformanceState()
  return state.fps
}

export const usePerformanceEnabled = (): boolean => {
  const { isEnabled } = usePerformanceMonitor()
  return isEnabled
}

export const useAttachAxios = (): PerformanceMonitorContextValue["attachAxios"] => {
  const { attachAxios } = usePerformanceMonitor()
  return useMemo(() => attachAxios, [attachAxios])
}
