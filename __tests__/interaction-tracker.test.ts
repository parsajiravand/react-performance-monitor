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
