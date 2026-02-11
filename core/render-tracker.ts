import type { ProfilerOnRenderCallback, ReactElement, ComponentType } from "react"
import { RenderEntry, RenderListener, TrackerCleanup } from "./types"

const componentNameCache = new WeakMap<object, string>()

const resolveComponentName = (type: ComponentType | string): string => {
  if (typeof type === "string") {
    return type
  }

  if (componentNameCache.has(type)) {
    return componentNameCache.get(type) as string
  }

  const displayName =
    (type as ComponentType & { displayName?: string }).displayName || type.name || "Anonymous"

  componentNameCache.set(type, displayName)
  return displayName
}

export const createProfilerCallback =
  (listener: RenderListener): ProfilerOnRenderCallback =>
  (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
    const entry: RenderEntry = {
      component: id,
      actualDuration,
      baseDuration,
      startTime,
      commitTime,
      phase
    }

    listener(entry)
  }

export const patchCreateElement = <P>(
  ReactModule: {
    createElement: (...args: unknown[]) => ReactElement<P, string | ComponentType<P>>
  },
  onRecord?: (name: string) => void
): TrackerCleanup => {
  if (typeof ReactModule?.createElement !== "function") {
    return () => {}
  }

  const originalCreateElement = ReactModule.createElement

  const patchedCreateElement = (
    type: ComponentType<P> | string,
    ...rest: unknown[]
  ): ReactElement<P, string | ComponentType<P>> => {
    if (typeof type === "function" || typeof type === "object") {
      const name = resolveComponentName(type as ComponentType)
      onRecord?.(name)
    }

    return originalCreateElement(type, ...(rest as []))
  }

  ReactModule.createElement = patchedCreateElement as typeof ReactModule.createElement

  return () => {
    ReactModule.createElement = originalCreateElement
  }
}
