# Next.js

Using React Performance Monitoring with [Next.js](https://nextjs.org/) works with built-in SSR safeguards.

## Setup

1. Install the package:

```bash
npm install react-performance-monitoring
```

2. Wrap your app in the root layout or `_app` / `pages/_app.tsx` (App Router or Pages Router).

### App Router (Next.js 13+)

```tsx
// app/layout.tsx
import { DevHUD } from "react-performance-monitoring"

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DevHUD>
          {children}
        </DevHUD>
      </body>
    </html>
  )
}
```

### Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app"
import { DevHUD } from "react-performance-monitoring"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DevHUD>
      <Component {...pageProps} />
    </DevHUD>
  )
}
```

## SSR Safety

The package is SSR-safe:

- All trackers check `typeof window !== "undefined"` before running.
- `DevHUD` checks for a browser environment and only mounts the overlay on the client.
- In production (`NODE_ENV === "production"`), no trackers or overlay are mounted.

During server-side rendering, `DevHUD` simply renders `children` with no side effects.

## Development

```bash
npm run dev
```

The HUD appears in the browser. Next.js sets `NODE_ENV=development` for the dev server.

## Production Build

```bash
npm run build
npm start
```

In production, the package does not mount the HUD or any trackers.

## Dynamic Import (Optional)

If you prefer to load the HUD only on the client, use `next/dynamic` with `ssr: false`:

```tsx
import dynamic from "next/dynamic"

const DevHUD = dynamic(
  () =>
    import("react-performance-monitoring").then(mod => mod.DevHUD),
  { ssr: false }
)

export default function App({ Component, pageProps }) {
  return (
    <DevHUD>
      <Component {...pageProps} />
    </DevHUD>
  )
}
```

This is optional; the default import is already safe for SSR.
