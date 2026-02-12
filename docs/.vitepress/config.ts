import { defineConfig } from "vitepress"

export default defineConfig({
  title: "React Performance Monitoring",
  description:
    "Developer-focused performance monitoring HUD for React applications. Track interactions, renders, network calls, long tasks, and FPS.",
  base: "/",
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/quick-start" },
      { text: "Frameworks", link: "/guides/vite" },
      { text: "API", link: "/api/devhud" },
      { text: "Examples", link: "/examples/" },
      { text: "FAQ", link: "/faq" }
    ],
    sidebar: {
      "/guide/": [
        { text: "Quick Start", link: "/guide/quick-start" },
        { text: "Installation", link: "/guide/installation" },
        { text: "Configuration", link: "/guide/configuration" },
        { text: "Tracking Tags", link: "/guide/tracking-tags" },
        { text: "Axios Integration", link: "/guide/axios-integration" }
      ],
      "/api/": [
        { text: "DevHUD", link: "/api/devhud" },
        { text: "Hooks", link: "/api/hooks" },
        { text: "Types", link: "/api/types" }
      ],
      "/guides/": [
        { text: "Vite", link: "/guides/vite" },
        { text: "Create React App", link: "/guides/cra" },
        { text: "Next.js", link: "/guides/nextjs" }
      ]
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/parsajiravand/react-performance-monitor"
      }
    ]
  }
})
