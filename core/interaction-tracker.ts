import { Interaction, InteractionListener, TrackerCleanup } from "./types"

const DEFAULT_EVENTS: Array<keyof DocumentEventMap> = ["click", "input", "submit"]
const ID_ATTRIBUTE = "data-rpm-id"
const GROUP_ATTRIBUTE = "data-rpm-group"

export interface InteractionTrackerOptions {
  events?: Array<keyof DocumentEventMap>
  windowRef?: Window
}

const isElement = (target: EventTarget | null): target is Element =>
  !!target && target instanceof Element

const resolveInteractionId = (target: EventTarget | null): string => {
  if (!isElement(target)) {
    return "unknown"
  }

  const candidate = target.closest(`[${ID_ATTRIBUTE}]`) as Element | null
  if (candidate?.getAttribute(ID_ATTRIBUTE)) {
    return candidate.getAttribute(ID_ATTRIBUTE) as string
  }

  const group = target.closest(`[${GROUP_ATTRIBUTE}]`) as Element | null
  if (group?.getAttribute(GROUP_ATTRIBUTE)) {
    return group.getAttribute(GROUP_ATTRIBUTE) as string
  }

  if (target.id) {
    return target.id
  }

  return target.tagName.toLowerCase()
}

const createInteractionEvent =
  (listener: InteractionListener) =>
  (event: Event): void => {
    const interaction: Interaction = {
      id: resolveInteractionId(event.target),
      type: event.type,
      startTime: performance.now()
    }

    listener(interaction)
  }

export const createInteractionTracker = (
  listener: InteractionListener,
  options: InteractionTrackerOptions = {}
): TrackerCleanup => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {}
  }

  const win = options.windowRef ?? window
  const events = options.events ?? DEFAULT_EVENTS
  const handler = createInteractionEvent(listener)

  events.forEach(eventType => {
    win.document.addEventListener(eventType, handler, { capture: true })
  })

  return () => {
    events.forEach(eventType => {
      win.document.removeEventListener(eventType, handler, { capture: true })
    })
  }
}
