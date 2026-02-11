import { Profiler, type ReactNode, useMemo } from "react"
import { createProfilerCallback } from "../core/render-tracker"
import type { RenderListener } from "../core/types"

export interface ProfilerWrapperProps {
  id?: string
  onRender: RenderListener
  children: ReactNode
}

export const ProfilerWrapper = ({ id = "Root", onRender, children }: ProfilerWrapperProps) => {
  const callback = useMemo(() => createProfilerCallback(onRender), [onRender])

  return (
    <Profiler id={id} onRender={callback}>
      {children}
    </Profiler>
  )
}
