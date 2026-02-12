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

const MAX_LABEL_LENGTH = 30

const truncate = (s: string): string =>
  s.trim().slice(0, MAX_LABEL_LENGTH).replace(/\s+/g, " ")

const getAttr = (el: Element, name: string): string | null => {
  const v = el.getAttribute(name)
  return v && v.trim() ? v.trim() : null
}

const getTextContent = (el: Element): string | null => {
  const text = el.textContent?.trim()
  if (!text) return null
  return truncate(text)
}

const isLabeledControl = (el: Element): boolean => {
  const tag = el.tagName
  const role = el.getAttribute("role")
  return (
    tag === "BUTTON" ||
    tag === "A" ||
    role === "button" ||
    role === "menuitem" ||
    role === "tab"
  )
}

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

  const el = target as HTMLElement

  const ariaLabel = getAttr(el, "aria-label")
  if (ariaLabel) return truncate(ariaLabel)

  const placeholder = getAttr(el, "placeholder")
  if (placeholder && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
    return truncate(placeholder)
  }

  const testId = getAttr(el, "data-testid")
  if (testId) return truncate(testId)

  const name = getAttr(el, "name")
  if (
    name &&
    (el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA")
  ) {
    return truncate(name)
  }

  if (isLabeledControl(el)) {
    const text = getTextContent(el)
    if (text) return text
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
