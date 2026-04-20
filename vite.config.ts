import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path"; // 1. Import path

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // 2. Explicitly define the @ alias
    },
  },
  plugins: [
    cloudflare({
      viteEnvironment: {
        name: "ssr",
    },
    }),
    tanstackStart(),
  ],
});