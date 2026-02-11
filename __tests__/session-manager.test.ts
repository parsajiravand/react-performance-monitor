import { describe, expect, it, vi } from "vitest"
import { createPerformanceStore } from "../core/store"
import { createSessionManager } from "../core/session-manager"

describe("session manager", () => {
  it("groups renders and network calls within the session window", () => {
    vi.useFakeTimers()

    const store = createPerformanceStore()
    const manager = createSessionManager(store, { sessionTimeout: 200 })

    manager.handleInteraction({
      id: "load-users",
      type: "click",
      startTime: 0
    })

    manager.handleRender({
      component: "UserList",
      actualDuration: 12,
      baseDuration: 10,
      startTime: 15,
      commitTime: 20,
      phase: "mount"
    })

    manager.handleNetwork({
      url: "/api/users",
      method: "GET",
      status: 200,
      duration: 80,
      startTime: 30,
      endTime: 110
    })

    const state = store.getState()
    expect(state.sessions).toHaveLength(1)
    const session = state.sessions[0]
    expect(session.interaction.id).toBe("load-users")
    expect(session.renders).toHaveLength(1)
    expect(session.network).toHaveLength(1)
    expect(state.activeSessionId).toBe(session.id)

    vi.advanceTimersByTime(250)
    vi.runAllTimers()

    expect(store.getState().activeSessionId).toBeNull()

    vi.useRealTimers()
  })
})
