import { FPSData, FPSListener, TrackerCleanup } from "./types"

export interface FPSTrackerOptions {
  windowRef?: Window
  sampleInterval?: number
}

export const createFPSTracker = (
  listener: FPSListener,
  options: FPSTrackerOptions = {}
): TrackerCleanup => {
  if (typeof window === "undefined") {
    return () => {}
  }

  const win = options.windowRef ?? window
  const interval = options.sampleInterval ?? 1000
  let animationFrameId = 0
  let lastTimestamp = 0
  let frames = 0
  let minFPS = Number.POSITIVE_INFINITY

  const loop = (timestamp: number) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp
    }

    frames += 1
    const elapsed = timestamp - lastTimestamp

    if (elapsed >= interval) {
      const fps = Math.round((frames * 1000) / elapsed)
      minFPS = Math.min(minFPS, fps)
      listener({
        current: fps,
        min: minFPS === Number.POSITIVE_INFINITY ? fps : minFPS,
        timestamp
      })
      frames = 0
      lastTimestamp = timestamp
    }

    animationFrameId = win.requestAnimationFrame(loop)
  }

  animationFrameId = win.requestAnimationFrame(loop)

  return () => {
    if (animationFrameId) {
      win.cancelAnimationFrame(animationFrameId)
    }
  }
}
