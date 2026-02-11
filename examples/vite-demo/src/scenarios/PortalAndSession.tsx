import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { axiosInstance, useAxiosTracking } from "../lib/perfTools"
import type { ScenarioComponentProps } from "./types"

const PortalAndSession = ({ hudConfig, onUpdateHudConfig }: ScenarioComponentProps) => {
  const [sessionTimeout, setSessionTimeout] = useState(hudConfig.sessionTimeout ?? 2500)
  const [modalOpen, setModalOpen] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const { attach } = useAxiosTracking(axiosInstance)

  useEffect(() => {
    setSessionTimeout(hudConfig.sessionTimeout ?? 2500)
  }, [hudConfig.sessionTimeout])

  useEffect(() => {
    const needsUpdate =
      !hudConfig.trackNetwork || !hudConfig.trackLongTasks || !hudConfig.trackFPS

    if (needsUpdate) {
      onUpdateHudConfig({
        trackNetwork: true,
        trackLongTasks: true,
        trackFPS: true
      })
    }
    const teardown = attach()
    return () => {
      teardown()
    }
  }, [attach, hudConfig.trackFPS, hudConfig.trackLongTasks, hudConfig.trackNetwork, onUpdateHudConfig])

  const handleTimeoutChange = (value: number) => {
    setSessionTimeout(value)
    onUpdateHudConfig({ sessionTimeout: value })
  }

  const logNote = (message: string) => {
    setNotes(previous => [message, ...previous].slice(0, 6))
  }

  const openModal = () => {
    setModalOpen(true)
    logNote("Opened modal portal interaction")
  }

  const submitModal = () => {
    setModalOpen(false)
    logNote("Modal submit interaction logged")
  }

  const cancelModal = () => {
    setModalOpen(false)
    logNote("Modal cancelled")
  }

  const fireModalRequest = async () => {
    logNote("Modal fetch kicked off")
    await axiosInstance.get("https://jsonplaceholder.typicode.com/todos/1")
    logNote("Modal fetch resolved")
  }

  const modalContainer = useMemo(() => {
    if (typeof document === "undefined") {
      return null
    }
    const node = document.createElement("div")
    node.setAttribute("data-rpm-group", "portal-modal")
    return node
  }, [])

  useEffect(() => {
    if (!modalContainer) {
      return
    }
    document.body.appendChild(modalContainer)
    return () => {
      if (modalContainer.parentNode) {
        modalContainer.parentNode.removeChild(modalContainer)
      }
    }
  }, [modalContainer])

  return (
    <div className="scenario-panel" data-rpm-group="portal-session">
      <header>
        <h2>Portals &amp; Session Control</h2>
        <p>
          Tweak interaction session boundaries and confirm that portal-based UI continues to surface
          interaction identifiers and network calls in the HUD timeline.
        </p>
      </header>

      <section className="control-strip">
        <label htmlFor="session-timeout-slider">
          Session timeout ({sessionTimeout}ms)
          <input
            id="session-timeout-slider"
            type="range"
            min={500}
            max={5000}
            step={250}
            value={sessionTimeout}
            onChange={event => handleTimeoutChange(Number(event.target.value))}
            data-rpm-id="adjust-session-timeout"
          />
        </label>
        <button type="button" data-rpm-id="open-portal" onClick={openModal}>
          Open portal modal
        </button>
      </section>

      <section className="list-panel">
        <h3>Recent events</h3>
        {notes.length === 0 ? (
          <p className="empty-state">Open the modal or adjust session timeout to see updates.</p>
        ) : (
          <ul className="activity-log">
            {notes.map(note => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </section>

      {modalOpen && modalContainer
        ? createPortal(
            <div className="modal-backdrop">
              <div className="modal">
                <header>
                  <h3>Portal Interaction</h3>
                </header>
                <p>
                  Actions inside this portal carry `data-rpm-id` attributes. Submit the modal or fire
                  the extra request to inspect grouping inside the HUD.
                </p>
                <div className="modal__actions">
                  <button type="button" data-rpm-id="modal-request" onClick={fireModalRequest}>
                    Fetch example
                  </button>
                  <button type="button" data-rpm-id="modal-submit" onClick={submitModal}>
                    Submit &amp; close
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    data-rpm-id="modal-cancel"
                    onClick={cancelModal}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>,
            modalContainer
          )
        : null}
    </div>
  )
}

export default PortalAndSession
