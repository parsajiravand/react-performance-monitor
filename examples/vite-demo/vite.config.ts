import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-performance-monitor": path.resolve(__dirname, "../..")
    }
  },
  server: {
    port: 5174
  }
})
