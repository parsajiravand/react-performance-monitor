import { LongTaskEntry, LongTaskListener, TrackerCleanup, LongTaskAttribution } from "./types"

export interface LongTaskTrackerOptions {
  windowRef?: Window
}

export const createLongTaskTracker = (
  listener: LongTaskListener,
  options: LongTaskTrackerOptions = {}
): TrackerCleanup => {
  if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
    return () => {}
  }

  type PerformanceLongTaskEntry = PerformanceEntry & { attribution?: LongTaskAttribution[] }

  const observer = new PerformanceObserver((list: PerformanceObserverEntryList) => {
    list.getEntries().forEach((entry: PerformanceEntry) => {
      if (entry.entryType !== "longtask") {
        return
      }

      const longTask = entry as PerformanceLongTaskEntry
      const normalized: LongTaskEntry = {
        name: longTask.name,
        duration: longTask.duration,
        startTime: longTask.startTime,
        attribution: longTask.attribution
      }
      listener(normalized)
    })
  })

  observer.observe({ entryTypes: ["longtask"] })

  return () => {
    observer.disconnect()
  }
}
