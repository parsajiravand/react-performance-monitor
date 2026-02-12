import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import axios, { type AxiosInstance } from "axios"
import { useAttachAxios } from "react-performance-monitoring"

export const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 5000
})

export const triggerLongTask = (durationMs: number) => {
  const start = performance.now()
  while (performance.now() - start < durationMs) {
    Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER)
  }
}

export interface FrameStressorOptions {
  workMs?: number
  restFrames?: number
}

export const useFrameStressor = (enabled: boolean, options: FrameStressorOptions = {}) => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const workMs = options.workMs ?? 12
    const restFrames = options.restFrames ?? 0

    let rafId = 0
    let frameCounter = 0
    let running = true

    const loop = () => {
      if (!running) {
        return
      }

      if (frameCounter === 0) {
        const start = performance.now()
        while (performance.now() - start < workMs) {
          Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER)
        }
      }

      frameCounter = (frameCounter + 1) % (restFrames + 1)
      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      running = false
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [enabled, options.workMs, options.restFrames])
}

export const useAxiosTracking = (instance: AxiosInstance) => {
  const attachAxios = useAttachAxios()
  const teardownRef = useRef<(() => void) | null>(null)
  const [attached, setAttached] = useState(false)

  const bridge = useMemo(
    () => ({
      interceptors: {
        request: {
          use: (
            onFulfilled?: ((value: unknown) => unknown | Promise<unknown>) | undefined,
            onRejected?: ((error: unknown) => unknown) | undefined
          ) =>
            instance.interceptors.request.use(
              onFulfilled as never,
              onRejected as never
            ),
          eject: (id: number) => instance.interceptors.request.eject(id)
        },
        response: {
          use: (
            onFulfilled?: ((value: unknown) => unknown | Promise<unknown>) | undefined,
            onRejected?: ((error: unknown) => unknown) | undefined
          ) =>
            instance.interceptors.response.use(
              onFulfilled as never,
              onRejected as never
            ),
          eject: (id: number) => instance.interceptors.response.eject(id)
        }
      }
    }),
    [instance]
  )

  const detachInternal = useCallback(() => {
    const teardown = teardownRef.current
    if (teardown) {
      teardownRef.current = null
      teardown()
    }
    setAttached(false)
  }, [])

  const attach = useCallback(() => {
    if (teardownRef.current) {
      return () => detachInternal()
    }
    const teardown = attachAxios(
      bridge as unknown as {
        interceptors: {
          request: {
            use: (...args: unknown[]) => number
            eject: (id: number) => void
          }
          response: {
            use: (...args: unknown[]) => number
            eject: (id: number) => void
          }
        }
      }
    )
    const wrapped = () => {
      teardown()
      detachInternal()
    }
    teardownRef.current = wrapped
    setAttached(true)
    return wrapped
  }, [attachAxios, bridge, detachInternal])

  const detach = useCallback(() => {
    detachInternal()
  }, [detachInternal])

  useEffect(() => {
    return () => {
      detachInternal()
    }
  }, [detachInternal])

  return { attach, detach, attached }
}
