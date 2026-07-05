export type TrackParams = Record<string, string | number | boolean>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(eventName: string, params: TrackParams = {}): void {
  if (typeof window === "undefined") {
    return
  }

  const payload = {
    event: eventName,
    ...params,
    timestamp: Date.now(),
  }

  window.dataLayer?.push(payload)

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params)
  }
}
