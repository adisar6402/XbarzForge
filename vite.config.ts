import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// PORT is only required for dev server
const rawPort = process.env.PORT;

const port =
  rawPort && !Number.isNaN(Number(rawPort))
    ? Number(rawPort)
    : 3000;

// BASE_PATH defaults to "/"
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,

  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.svg",
        "apple-touch-icon.png",
        "web-app-manifest-192x192.png",
        "web-app-manifest-512x512.png",
      ],

      manifest: {
        id: "/",

        name: "XbarzForge",
        short_name: "Forge",

        description:
          "AI-powered developer platform for intelligent code analysis, documentation generation, repository insights, and developer productivity.",

        theme_color: "#0BD9EB",
        background_color: "#0a0a0c",

        display: "standalone",
        orientation: "portrait-primary",

        scope: "/",
        start_url: "/",

        icons: [
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2}",
        ],

        navigateFallback: "/offline.html",

        navigateFallbackDenylist: [
          /^\/api\//,
        ],

        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/fonts\.googleapis\.com\/.*/i,

            handler: "CacheFirst",

            options: {
              cacheName: "google-fonts-cache",

              expiration: {
                maxEntries: 10,
                maxAgeSeconds:
                  60 * 60 * 24 * 365,
              },
            },
          },

          {
            urlPattern:
              /^https:\/\/fonts\.gstatic\.com\/.*/i,

            handler: "CacheFirst",

            options: {
              cacheName:
                "gstatic-fonts-cache",

              expiration: {
                maxEntries: 10,
                maxAgeSeconds:
                  60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: false,
      },
    }),

    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import(
            "@replit/vite-plugin-cartographer"
          ).then((m) =>
            m.cartographer({
              root: path.resolve(
                import.meta.dirname,
                ".."
              ),
            })
          ),

          await import(
            "@replit/vite-plugin-dev-banner"
          ).then((m) =>
            m.devBanner()
          ),
        ]
      : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(
        import.meta.dirname,
        "src"
      ),

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

  root: path.resolve(
    import.meta.dirname
  ),

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

    allowedHosts: true,

    proxy: {
      "/api": {
        target:
          "http://localhost:8080",

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

    allowedHosts: true,
  },
});