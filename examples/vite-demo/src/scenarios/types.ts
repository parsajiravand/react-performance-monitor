import type { DevHUDProps } from "react-performance-monitoring"

export interface ScenarioComponentProps {
  hudConfig: Partial<DevHUDProps>
  onUpdateHudConfig: (config: Partial<DevHUDProps>) => void
  resetHudConfig: () => void
}
