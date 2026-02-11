export interface RenderEntry {
  component: string
  actualDuration: number
  baseDuration: number
  startTime: number
  commitTime: number
  phase: "mount" | "update"
}

export interface NetworkEntry {
  url: string
  method: string
  status: number
  duration: number
  startTime: number
  endTime: number
}

export interface LongTaskEntry {
  name: string
  duration: number
  startTime: number
  attribution?: LongTaskAttribution[]
}

export interface Interaction {
  id: string
  type: string
  startTime: number
  endTime?: number
}

export interface FPSData {
  current: number
  min: number
  timestamp: number
}

export interface LongTaskAttribution {
  name?: string
  entryType?: string
  startTime?: number
  duration?: number
  containerType?: string
  containerName?: string
  containerId?: string
  containerSrc?: string
  [key: string]: unknown
}

export interface PerformanceSession {
  id: string
  interaction: Interaction
  renders: RenderEntry[]
  network: NetworkEntry[]
  longTasks: LongTaskEntry[]
  fpsSamples: FPSData[]
  startTime: number
  endTime?: number
}

export type InteractionListener = (interaction: Interaction) => void
export type NetworkListener = (entry: NetworkEntry) => void
export type RenderListener = (entry: RenderEntry) => void
export type LongTaskListener = (entry: LongTaskEntry) => void
export type FPSListener = (entry: FPSData) => void

export type TrackerCleanup = () => void
