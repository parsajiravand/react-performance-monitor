import { describe, expect, it, vi } from "vitest"
import { createInteractionTracker } from "../core/interaction-tracker"

describe("interaction tracker", () => {
  it("captures data-rpm-id attribute when interaction occurs", () => {
    const listener = vi.fn()
    const cleanup = createInteractionTracker(listener)

    document.body.innerHTML = `<button data-rpm-id="load-users">Load users</button>`
    const button = document.querySelector("button") as HTMLButtonElement

    button.click()

    expect(listener).toHaveBeenCalledTimes(1)
    const interaction = listener.mock.calls[0][0]
    expect(interaction.id).toBe("load-users")
    expect(interaction.type).toBe("click")

    cleanup()
    listener.mockClear()

    button.click()
    expect(listener).not.toHaveBeenCalled()
  })

  it("falls back to aria-label when no explicit id", () => {
    const listener = vi.fn()
    const cleanup = createInteractionTracker(listener)

    document.body.innerHTML = `<button aria-label="Close dialog">×</button>`
    const button = document.querySelector("button")!
    button.click()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].id).toBe("Close dialog")

    cleanup()
  })

  it("falls back to placeholder for inputs", () => {
    const listener = vi.fn()
    const cleanup = createInteractionTracker(listener)

    document.body.innerHTML = `<input type="text" placeholder="Search users..." />`
    const input = document.querySelector("input")!
    input.dispatchEvent(new Event("input", { bubbles: true }))

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].id).toBe("Search users...")

    cleanup()
  })

  it("falls back to data-testid when present", () => {
    const listener = vi.fn()
    const cleanup = createInteractionTracker(listener)

    document.body.innerHTML = `<button data-testid="submit-btn">Submit</button>`
    const button = document.querySelector("button")!
    button.click()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].id).toBe("submit-btn")

    cleanup()
  })

  it("falls back to name for form controls", () => {
    const listener = vi.fn()
    const cleanup = createInteractionTracker(listener)

    document.body.innerHTML = `<input type="text" name="email" />`
    const input = document.querySelector("input")!
    input.dispatchEvent(new Event("input", { bubbles: true }))

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].id).toBe("email")

    cleanup()
  })

  it("falls back to button text content when no other identifier", () => {
    const listener = vi.fn()
    const cleanup = createInteractionTracker(listener)

    document.body.innerHTML = `<button>Load users</button>`
    const button = document.querySelector("button")!
    button.click()

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0][0].id).toBe("Load users")

    cleanup()
  })

  it("falls back to tag name when no identifier is present", () => {
    const listener = vi.fn()
    const cleanup = createInteractionTracker(listener)

    document.body.innerHTML = `<div><span>Click me</span></div>`
    const span = document.querySelector("span") as HTMLSpanElement
    span.click()

    expect(listener).toHaveBeenCalledTimes(1)
    const interaction = listener.mock.calls[0][0]
    expect(interaction.id).toBe("span")

    cleanup()
  })
})
