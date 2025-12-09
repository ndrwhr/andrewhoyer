import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: false,
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        site: resolve(__dirname, "src/scripts/index.ts"),
        resume: resolve(__dirname, "src/styles/resume.css"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  css: {
    postcss: "./postcss.config.mjs",
  },
  server: {
    port: 3000,
    open: false,
  },
});
