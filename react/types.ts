import type { ReactNode } from "react"

export type HUDPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right"
export type HUDTheme = "light" | "dark"

export interface DevHUDProps {
  children: ReactNode
  position?: HUDPosition
  theme?: HUDTheme
  trackNetwork?: boolean
  trackLongTasks?: boolean
  trackFPS?: boolean
  sessionTimeout?: number
}
