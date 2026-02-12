import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { createPerformanceStore, type PerformanceStore } from "../core/store"
import { createSessionManager, type SessionManager } from "../core/session-manager"
import {
  createInteractionTracker,
  createLongTaskTracker,
  createFPSTracker,
  createNetworkTracker
} from "../core"
import type { TrackerCleanup, RenderEntry } from "../core/types"
import type { AxiosLikeInstance } from "../core/network-tracker"
import { ProfilerWrapper } from "./ProfilerWrapper"
import { PerformanceMonitorProvider, type PerformanceMonitorContextValue } from "./hooks"
import Overlay from "../ui/Overlay"
import type { DevHUDProps } from "./types"

const isDevelopmentEnvironment = (): boolean => {
  if (typeof process !== "undefined" && process.env?.NODE_ENV) {
    return process.env.NODE_ENV !== "production"
  }

  return true
}

/** Set by bundler define (e.g. Vite) when building demo for deployment */
const isForceEnabledByBuild = (): boolean =>
  typeof process !== "undefined" &&
  (process.env as Record<string, string>).RPM_FORCE_ENABLED === "true"

const noOpAttachAxios =
  (): ((instance: AxiosLikeInstance) => TrackerCleanup) =>
  () =>
    () => {}

const createOverlayContainer = (): HTMLElement | null => {
  if (typeof document === "undefined") {
    return null
  }

  const existing = document.querySelector("[data-rpm-root]")
  if (existing instanceof HTMLElement) {
    return existing
  }

  const node = document.createElement("div")
  node.setAttribute("data-rpm-root", "true")
  document.body.appendChild(node)
  return node
}

export const DevHUD = ({
  children,
  position = "top-right",
  theme = "dark",
  trackNetwork = true,
  trackLongTasks = true,
  trackFPS = true,
  sessionTimeout = 2000,
  forceEnabled = false
}: DevHUDProps) => {
  const isBrowser = typeof window !== "undefined"
  const isEnabled =
    isBrowser &&
    (forceEnabled || isForceEnabledByBuild() || isDevelopmentEnvironment())

  const storeRef = useRef<PerformanceStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createPerformanceStore()
  }
  const store = storeRef.current

  const sessionManagerRef = useRef<SessionManager | null>(null)
  const attachAxiosRef = useRef<(instance: AxiosLikeInstance) => TrackerCleanup>(noOpAttachAxios())
  const [overlayNode, setOverlayNode] = useState<HTMLElement | null>(null)
  const [hudPosition, setHudPosition] = useState(position)

  useEffect(() => {
    setHudPosition(position)
  }, [position])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    const node = createOverlayContainer()
    setOverlayNode(node)

    return () => {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node)
      }
      setOverlayNode(null)
    }
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled) {
      console.log("RPM: DevHUD not enabled, skipping trackers")
      return
    }

    console.log("RPM: Starting trackers", { trackNetwork, trackLongTasks, trackFPS })

    const sessionManager = createSessionManager(store, { sessionTimeout })
    sessionManagerRef.current = sessionManager

    const cleanups: TrackerCleanup[] = []

    cleanups.push(createInteractionTracker(interaction => {
      console.log("RPM: Interaction tracked", interaction)
      sessionManager.handleInteraction(interaction)
    }))

    if (trackNetwork) {
      console.log("RPM: Starting network tracker")
      const networkTracker = createNetworkTracker(entry => {
        console.log("RPM: Network entry", entry)
        sessionManager.handleNetwork(entry)
      })
      networkTracker.start()
      attachAxiosRef.current = instance => networkTracker.attachAxios(instance)
      cleanups.push(() => {
        networkTracker.stop()
        attachAxiosRef.current = noOpAttachAxios()
      })
    } else {
      attachAxiosRef.current = noOpAttachAxios()
    }

    if (trackLongTasks) {
      console.log("RPM: Starting long task tracker")
      cleanups.push(createLongTaskTracker(task => {
        console.log("RPM: Long task", task)
        sessionManager.handleLongTask(task)
      }))
    }

    if (trackFPS) {
      console.log("RPM: Starting FPS tracker")
      cleanups.push(createFPSTracker(fps => {
        console.log("RPM: FPS sample", fps)
        sessionManager.handleFPS(fps)
      }))
    }

    return () => {
      console.log("RPM: Cleaning up trackers")
      cleanups.forEach(dispose => dispose())
      sessionManagerRef.current?.dispose()
      sessionManagerRef.current = null
      attachAxiosRef.current = noOpAttachAxios()
    }
  }, [isEnabled, sessionTimeout, store, trackNetwork, trackLongTasks, trackFPS])

  const handleRender = useCallback(
    (entry: RenderEntry) => {
      sessionManagerRef.current?.handleRender(entry)
    },
    []
  )

  const attachAxios = useCallback(
    (instance: AxiosLikeInstance) => attachAxiosRef.current(instance),
    [attachAxiosRef]
  )

  const contextValue = useMemo<PerformanceMonitorContextValue>(
    () => ({
      store,
      attachAxios,
      isEnabled
    }),
    [store, attachAxios, isEnabled]
  )

  if (!isEnabled) {
    return <Fragment>{children}</Fragment>
  }

  return (
    <PerformanceMonitorProvider value={contextValue}>
      <ProfilerWrapper id="RPMRoot" onRender={handleRender}>
        {children}
      </ProfilerWrapper>
      {overlayNode
        ? createPortal(
            <Overlay
              position={hudPosition}
              theme={theme}
              onPositionChange={setHudPosition}
            />,
            overlayNode
          )
        : null}
    </PerformanceMonitorProvider>
  )
}
