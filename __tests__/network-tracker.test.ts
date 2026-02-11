import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createNetworkTracker } from "../core/network-tracker"

describe("network tracker", () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => new Response(null, { status: 204 })) as unknown as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it("wraps and restores fetch while emitting network entries", async () => {
    const listener = vi.fn()
    const tracker = createNetworkTracker(listener)

    expect(globalThis.fetch).toBeInstanceOf(Function)

    tracker.start()

    expect(listener).not.toHaveBeenCalled()

    await globalThis.fetch("/api/user", { method: "post" })

    expect(listener).toHaveBeenCalledTimes(1)
    const entry = listener.mock.calls[0][0]
    expect(entry.url).toBe("/api/user")
    expect(entry.method).toBe("POST")
    expect(entry.status).toBe(204)
    expect(entry.duration).toBeGreaterThanOrEqual(0)

    tracker.stop()

    await globalThis.fetch("/api/other")
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
