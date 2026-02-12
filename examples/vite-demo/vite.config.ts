import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "react-performance-monitoring",
        replacement: path.resolve(__dirname, "../..")
      },
      {
        find: /^react-dom$/,
        replacement: path.resolve(__dirname, "node_modules/react-dom/profiling.js")
      }
    ]
  },
  define: {
    "process.env.RPM_FORCE_ENABLED": JSON.stringify("true")
  },
  server: {
    port: 5174
  }
})
