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
  sessionTimeout = 2000
}: DevHUDProps) => {
  const isBrowser = typeof window !== "undefined"
  const isEnabled = isBrowser && isDevelopmentEnvironment()

  const storeRef = useRef<PerformanceStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createPerformanceStore()
  }
  const store = storeRef.current

  const sessionManagerRef = useRef<SessionManager | null>(null)
  const attachAxiosRef = useRef<(instance: AxiosLikeInstance) => TrackerCleanup>(noOpAttachAxios())
  const [overlayNode, setOverlayNode] = useState<HTMLElement | null>(null)

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
      return
    }

    const sessionManager = createSessionManager(store, { sessionTimeout })
    sessionManagerRef.current = sessionManager

    const cleanups: TrackerCleanup[] = []

    cleanups.push(createInteractionTracker(interaction => sessionManager.handleInteraction(interaction)))

    if (trackNetwork) {
      const networkTracker = createNetworkTracker(entry => sessionManager.handleNetwork(entry))
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
      cleanups.push(createLongTaskTracker(task => sessionManager.handleLongTask(task)))
    }

    if (trackFPS) {
      cleanups.push(createFPSTracker(fps => sessionManager.handleFPS(fps)))
    }

    return () => {
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
      {overlayNode ? createPortal(<Overlay position={position} theme={theme} />, overlayNode) : null}
    </PerformanceMonitorProvider>
  )
}
