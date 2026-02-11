import { NetworkEntry, NetworkListener, TrackerCleanup } from "./types"

export interface NetworkTrackerOptions {
  windowRef?: Window
  trackFetch?: boolean
}

interface AxiosInterceptorManager<V = unknown> {
  use(onFulfilled?: (value: V) => V | Promise<V>, onRejected?: (error: unknown) => unknown): number
  eject(id: number): void
}

export interface AxiosLikeInstance {
  interceptors: {
    request: AxiosInterceptorManager<AxiosRequestLike>
    response: AxiosInterceptorManager<AxiosResponseLike>
  }
}

const now = (): number => (typeof performance !== "undefined" ? performance.now() : Date.now())

const normalizeMethod = (init?: RequestInit): string =>
  init?.method?.toUpperCase() || (init?.body ? "POST" : "GET") // heuristic fallback when method not provided

type AxiosRequestLike = {
  url?: string
  method?: string
  [key: string]: unknown
}

type AxiosResponseLike = {
  status: number
  config: AxiosRequestLike
  [key: string]: unknown
}

type AxiosErrorLike = {
  config?: AxiosRequestLike
  response?: AxiosResponseLike
  [key: string]: unknown
}

export const createNetworkTracker = (
  listener: NetworkListener,
  options: NetworkTrackerOptions = {}
) => {
  if (typeof window === "undefined") {
    return {
      start: () => {},
      stop: () => {},
      attachAxios: () => () => {}
    }
  }

  const win = options.windowRef ?? window
  let originalFetch: typeof win.fetch | null = null
  let fetchPatched = false

  const patchFetch = () => {
    if (fetchPatched || typeof win.fetch !== "function") {
      return
    }

    originalFetch = win.fetch.bind(win)
    fetchPatched = true

    const RequestCtor: typeof Request | undefined =
      typeof Request !== "undefined" ? Request : undefined

    win.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const startTime = now()
      let method = init?.method
      let url: string

      if (typeof input === "string") {
        url = input
      } else if (input instanceof URL) {
        url = input.toString()
        method = method ?? init?.method
      } else if (RequestCtor && input instanceof RequestCtor) {
        url = input.url
        method = method ?? input.method
      } else {
        url = (input as { url?: string }).url ?? "unknown"
      }

      const normalizedMethod = (method ?? normalizeMethod(init)).toUpperCase()

      try {
        const response = await originalFetch!(input, init)
        const endTime = now()
        const entry: NetworkEntry = {
          url,
          method: normalizedMethod,
          status: response.status,
          duration: endTime - startTime,
          startTime,
          endTime
        }
        listener(entry)
        return response
      } catch (error) {
        const endTime = now()
        const entry: NetworkEntry = {
          url,
          method: normalizedMethod,
          status: 0,
          duration: endTime - startTime,
          startTime,
          endTime
        }
        listener(entry)
        throw error
      }
    }
  }

  const restoreFetch = () => {
    if (fetchPatched && originalFetch) {
      win.fetch = originalFetch
    }
    fetchPatched = false
    originalFetch = null
  }

  const attachAxios = (axiosInstance: AxiosLikeInstance): TrackerCleanup => {
    if (!axiosInstance?.interceptors?.request || !axiosInstance?.interceptors?.response) {
      return () => {}
    }

    let requestId: number | undefined
    let responseId: number | undefined

    requestId = axiosInstance.interceptors.request.use((config: AxiosRequestLike) => {
      ;(config as Record<string, unknown>)._rpmStartTime = now()
      return config
    })

    responseId = axiosInstance.interceptors.response.use(
      (response: AxiosResponseLike) => {
        const startTime = (response.config as Record<string, unknown>)._rpmStartTime as
          | number
          | undefined
        const endTime = now()
        listener({
          url: response.config?.url ?? "unknown",
          method: response.config?.method?.toUpperCase() ?? "GET",
          status: response.status,
          duration: startTime ? endTime - startTime : endTime,
          startTime: startTime ?? endTime,
          endTime
        })
        return response
      },
      (error: unknown) => {
        const axiosError = error as AxiosErrorLike
        const config = axiosError?.config ?? {}
        const startTime = (config as Record<string, unknown>)._rpmStartTime as number | undefined
        const endTime = now()
        listener({
          url: config?.url ?? "unknown",
          method: config?.method?.toUpperCase() ?? "GET",
          status: axiosError?.response?.status ?? 0,
          duration: startTime ? endTime - startTime : endTime,
          startTime: startTime ?? endTime,
          endTime
        })
        return Promise.reject(error)
      }
    )

    return () => {
      if (typeof requestId === "number") {
        axiosInstance.interceptors.request.eject(requestId)
      }
      if (typeof responseId === "number") {
        axiosInstance.interceptors.response.eject(responseId)
      }
    }
  }

  return {
    start: () => {
      if (options.trackFetch !== false) {
        patchFetch()
      }
    },
    stop: () => {
      restoreFetch()
    },
    attachAxios
  }
}
