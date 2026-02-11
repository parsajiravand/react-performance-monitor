import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { DevHUD } from "../react/DevHUD"

describe("DevHUD component", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders children and overlay in development environments", async () => {
    const { unmount } = render(
      <DevHUD>
        <div>App Content</div>
      </DevHUD>
    )

    expect(screen.getByText("App Content")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("No interactions yet")).toBeInTheDocument()
    })

    const portalContainer = document.querySelector("[data-rpm-root]")
    expect(portalContainer).toBeInstanceOf(HTMLElement)

    unmount()

    await waitFor(() => {
      expect(document.querySelector("[data-rpm-root]")).toBeNull()
    })
  })
})
