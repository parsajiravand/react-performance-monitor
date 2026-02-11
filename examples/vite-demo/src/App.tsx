import { useEffect, useMemo, useState } from "react"
import { DevHUD, type DevHUDProps } from "react-performance-monitor"
import BasicInteractions from "./scenarios/BasicInteractions"
import NetworkStress from "./scenarios/NetworkStress"
import LongTaskAndFPS from "./scenarios/LongTaskAndFPS"
import PortalAndSession from "./scenarios/PortalAndSession"
import RenderLoadComparison from "./scenarios/RenderLoadComparison"
import type { ScenarioComponentProps } from "./scenarios/types"
import "./app.css"

type ScenarioDefinition = {
  id: string
  title: string
  description: string
  observations: string[]
  Component: React.FC<ScenarioComponentProps>
  defaultHudConfig?: Partial<DevHUDProps>
}

const BASE_HUD_CONFIG: Partial<DevHUDProps> = {
  position: "top-right",
  theme: "dark",
  trackNetwork: true,
  trackLongTasks: true,
  trackFPS: true,
  sessionTimeout: 2000
}

const SCENARIOS: ScenarioDefinition[] = [
  {
    id: "basic-interactions",
    title: "Basic Interactions",
    description:
      "Core example covering interaction grouping, component renders, and data fetching.",
    observations: [
      "Click “Load users” to see interactions grouped with network & renders.",
      "Type in the filter to observe React render timings in the HUD timeline.",
      "Refresh the list to inspect repeated renders and shallow comparisons."
    ],
    Component: BasicInteractions,
    defaultHudConfig: {
      sessionTimeout: 2000,
      trackNetwork: true,
      trackLongTasks: true,
      trackFPS: true
    }
  },
  {
    id: "network-stress",
    title: "Network Stress",
    description:
      "Slow and failing requests demonstrate network instrumentation, plus toggling axios interception.",
    observations: [
      "Trigger slow and failing requests to compare durations and status codes.",
      "Detach axios tracking to prove teardown restores the original fetch implementation.",
      "Watch the timeline differentiate parallel requests."
    ],
    Component: NetworkStress,
    defaultHudConfig: {
      trackNetwork: true,
      trackLongTasks: false,
      trackFPS: false
    }
  },
  {
    id: "longtask-fps",
    title: "Long Tasks & FPS",
    description:
      "Generate main-thread jank and FPS drops to visualise long task monitoring and performance samples.",
    observations: [
      "Fire standalone long tasks to populate the long-task tracker.",
      "Run the FPS stressor to watch frame rate minimums fluctuate.",
      "Compare sessions with and without the stressor active."
    ],
    Component: LongTaskAndFPS,
    defaultHudConfig: {
      trackNetwork: false,
      trackLongTasks: true,
      trackFPS: true,
      sessionTimeout: 1500
    }
  },
  {
    id: "portal-session",
    title: "Portals & Session Control",
    description:
      "Explore session boundaries, modal/portal interactions, and configurable timeouts.",
    observations: [
      "Open the modal to confirm portal interactions retain their rpm identifiers.",
      "Adjust the session timeout slider to see when sessions close automatically.",
      "Inspect how renders, long tasks, and network calls merge under shared identifiers."
    ],
    Component: PortalAndSession,
    defaultHudConfig: {
      sessionTimeout: 2500,
      trackNetwork: true,
      trackLongTasks: true,
      trackFPS: true
    }
  },
  {
    id: "render-load",
    title: "Render Load Comparison",
    description:
      "Evaluate initial render cost for lightweight vs. heavy lists and compare timeline metrics.",
    observations: [
      "Switch between clean and heavy lists to capture render durations in the metrics panel.",
      "Inspect long-task entries when the heavy list renders 200 expanded items.",
      "Use FPS + render stats to discuss whether the initial load is acceptable."
    ],
    Component: RenderLoadComparison,
    defaultHudConfig: {
      trackNetwork: false,
      trackLongTasks: true,
      trackFPS: true,
      sessionTimeout: 2000
    }
  }
]

const deriveHudProps = (config: Partial<DevHUDProps>): Omit<DevHUDProps, "children"> => ({
  position: config.position ?? "top-right",
  theme: config.theme ?? "dark",
  trackNetwork: config.trackNetwork ?? true,
  trackLongTasks: config.trackLongTasks ?? true,
  trackFPS: config.trackFPS ?? true,
  sessionTimeout: config.sessionTimeout ?? 2000
})

const App = () => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(SCENARIOS[0].id)

  const activeScenario = useMemo(
    () => SCENARIOS.find(scenario => scenario.id === activeScenarioId) ?? SCENARIOS[0],
    [activeScenarioId]
  )

  const [hudConfig, setHudConfig] = useState<Partial<DevHUDProps>>({
    ...BASE_HUD_CONFIG,
    ...(activeScenario.defaultHudConfig ?? {})
  })

  useEffect(() => {
    setHudConfig({
      ...BASE_HUD_CONFIG,
      ...(activeScenario.defaultHudConfig ?? {})
    })
  }, [activeScenarioId, activeScenario])

  const updateHudConfig = (config: Partial<DevHUDProps>) => {
    setHudConfig(previous => ({ ...previous, ...config }))
  }

  const resetHudConfig = () => {
    setHudConfig({
      ...BASE_HUD_CONFIG,
      ...(activeScenario.defaultHudConfig ?? {})
    })
  }

  const hudProps = deriveHudProps(hudConfig)
  const ScenarioComponent = activeScenario.Component

  return (
    <div className="app-shell">
      <aside className="scenario-sidebar">
        <h1>React Performance Monitor Demo</h1>
        <p>Select a scenario to explore how the HUD reacts to different performance events.</p>

        <ul className="scenario-list">
          {SCENARIOS.map(scenario => {
            const isActive = scenario.id === activeScenarioId

            return (
              <li key={scenario.id}>
                <button
                  type="button"
                  className={isActive ? "selected" : ""}
                  onClick={() => setActiveScenarioId(scenario.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="scenario-title">{scenario.title}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <section className="scenario-details">
          <h2>{activeScenario.title}</h2>
          <p>{activeScenario.description}</p>
          <ul>
            {activeScenario.observations.map(observation => (
              <li key={observation}>{observation}</li>
            ))}
          </ul>
          <button type="button" className="reset-button" onClick={resetHudConfig}>
            Reset HUD configuration
          </button>
        </section>
      </aside>

      <main className="scenario-stage">
        <DevHUD {...hudProps}>
          <ScenarioComponent
            hudConfig={hudConfig}
            onUpdateHudConfig={updateHudConfig}
            resetHudConfig={resetHudConfig}
          />
        </DevHUD>
      </main>
    </div>
  )
}

export default App
