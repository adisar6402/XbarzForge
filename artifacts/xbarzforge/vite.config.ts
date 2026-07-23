import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

const rawPort = process.env.PORT;
const port =
  rawPort && !Number.isNaN(Number(rawPort))
    ? Number(rawPort)
    : 3000;

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  appType: "spa",

  base: basePath,

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "apple-touch-icon.png",
      ],

      manifest: {
        name: "XbarzForge",
        short_name: "Forge",
        description:
          "AI-powered developer platform for intelligent code analysis, documentation generation, repository insights, and developer productivity.",

        start_url: "/",
        scope: "/",
        display: "standalone",

        background_color: "#0a0a0c",
        theme_color: "#0BD9EB",

        lang: "en",
        orientation: "portrait-primary",

        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),

      "@assets": path.resolve(
        import.meta.dirname,
        "..",
        "..",
        "attached_assets"
      ),
    },

    dedupe: [
      "react",
      "react-dom",
    ],
  },

  root: path.resolve(import.meta.dirname),

  build: {
    outDir: path.resolve(
      import.meta.dirname,
      "dist/public"
    ),

    emptyOutDir: true,
  },

  server: {
    port,

    strictPort: true,

    host: "0.0.0.0",

    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },

    fs: {
      strict: true,
    },
  },

  preview: {
    port,
    host: "0.0.0.0",
  },
});