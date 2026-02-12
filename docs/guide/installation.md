# Installation

## npm

```bash
npm install react-performance-monitoring
```

## yarn

```bash
yarn add react-performance-monitoring
```

## pnpm

```bash
pnpm add react-performance-monitoring
```

## Peer Dependencies

This package requires **React 18+** and **React DOM 18+**. Ensure they are installed in your project:

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

## Optional: Axios

If you use [Axios](https://github.com/axios/axios) and want to track its requests in the HUD, install it as well:

```bash
npm install axios
```

The package does not depend on Axios; it's only needed when you call `useAttachAxios` with an axios instance.

## Verify Installation

After installing, wrap your app root with `DevHUD` and start your dev server. In development, a floating HUD should appear in the corner of the viewport. See [Quick Start](/guide/quick-start) for the minimal setup.
